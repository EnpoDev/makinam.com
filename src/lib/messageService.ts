import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Listing } from '../types';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  text: string;
  createdAt: number;
  read: boolean;
}

export interface Conversation {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  listingCurrency: string;
  listingImage: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  buyerPhone?: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: number;
  lastSenderId: string;
  unreadBySeller?: boolean;
  unreadByBuyer?: boolean;
}

const LOCAL_STORAGE_CONVERSATIONS_KEY = 'makinam_local_conversations';
const LOCAL_STORAGE_MESSAGES_KEY = 'makinam_local_messages';

// Helper for local offline/fallback storage
function getLocalConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CONVERSATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalConversation(conv: Conversation) {
  try {
    const all = getLocalConversations().filter((c) => c.id !== conv.id);
    localStorage.setItem(LOCAL_STORAGE_CONVERSATIONS_KEY, JSON.stringify([conv, ...all]));
  } catch (e) {
    console.error('Error saving local conversation', e);
  }
}

function getLocalMessages(conversationId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_MESSAGES_KEY}_${conversationId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalMessage(msg: ChatMessage) {
  try {
    const key = `${LOCAL_STORAGE_MESSAGES_KEY}_${msg.conversationId}`;
    const all = getLocalMessages(msg.conversationId);
    localStorage.setItem(key, JSON.stringify([...all, msg]));
  } catch (e) {
    console.error('Error saving local message', e);
  }
}

/**
 * Sends a message from buyer to seller regarding a specific listing.
 */
export async function sendListingMessage({
  listing,
  sender,
  text
}: {
  listing: Listing;
  sender: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  text: string;
}): Promise<{ conversationId: string; messageId: string }> {
  const sellerId = listing.userId || 'seller_system';
  const sellerName = listing.seller?.name || 'Satıcı';
  const buyerId = sender.id;
  const buyerName = sender.name;

  // Consistent unique conversation ID for this buyer + listing
  const conversationId = `conv_${listing.id}_${buyerId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  const now = Date.now();

  const conversationData: Conversation = {
    id: conversationId,
    listingId: listing.id,
    listingTitle: listing.title,
    listingPrice: listing.price,
    listingCurrency: listing.currency,
    listingImage: listing.images?.[0] || '',
    sellerId,
    sellerName,
    buyerId,
    buyerName,
    buyerPhone: sender.phone || '',
    participants: [sellerId, buyerId],
    lastMessage: text,
    lastMessageTime: now,
    lastSenderId: buyerId,
    unreadBySeller: true,
    unreadByBuyer: false
  };

  const messageData: ChatMessage = {
    id: `msg_${now}_${Math.random().toString(36).substring(2, 7)}`,
    conversationId,
    senderId: buyerId,
    senderName: buyerName,
    receiverId: sellerId,
    receiverName: sellerName,
    text,
    createdAt: now,
    read: false
  };

  // Always save to localStorage immediately for instant local experience
  saveLocalConversation(conversationData);
  saveLocalMessage(messageData);

  // Sync to Firestore
  try {
    const convRef = doc(db, 'conversations', conversationId);
    await setDoc(convRef, conversationData, { merge: true });

    const msgRef = doc(db, 'conversations', conversationId, 'messages', messageData.id);
    await setDoc(msgRef, messageData);
  } catch (err) {
    console.warn('Firestore mesaj kaydı uyarısı, yerel depolama devrede:', err);
  }

  return { conversationId, messageId: messageData.id };
}

/**
 * Sends a reply inside an existing conversation.
 */
export async function sendReplyMessage({
  conversation,
  sender,
  text
}: {
  conversation: Conversation;
  sender: {
    id: string;
    name: string;
  };
  text: string;
}): Promise<ChatMessage> {
  const now = Date.now();
  const receiverId = sender.id === conversation.buyerId ? conversation.sellerId : conversation.buyerId;
  const receiverName = sender.id === conversation.buyerId ? conversation.sellerName : conversation.buyerName;

  const messageData: ChatMessage = {
    id: `msg_${now}_${Math.random().toString(36).substring(2, 7)}`,
    conversationId: conversation.id,
    senderId: sender.id,
    senderName: sender.name,
    receiverId,
    receiverName,
    text,
    createdAt: now,
    read: false
  };

  const updatedConv: Conversation = {
    ...conversation,
    lastMessage: text,
    lastMessageTime: now,
    lastSenderId: sender.id,
    unreadBySeller: sender.id === conversation.buyerId,
    unreadByBuyer: sender.id === conversation.sellerId
  };

  saveLocalConversation(updatedConv);
  saveLocalMessage(messageData);

  try {
    const convRef = doc(db, 'conversations', conversation.id);
    await updateDoc(convRef, {
      lastMessage: text,
      lastMessageTime: now,
      lastSenderId: sender.id,
      unreadBySeller: sender.id === conversation.buyerId,
      unreadByBuyer: sender.id === conversation.sellerId
    });

    const msgRef = doc(db, 'conversations', conversation.id, 'messages', messageData.id);
    await setDoc(msgRef, messageData);
  } catch (err) {
    console.warn('Mesaj yanıtı Firestore hatası:', err);
  }

  return messageData;
}

/**
 * Subscribes to all conversations of a user (either as buyer or seller).
 */
export function subscribeToUserConversations(
  userId: string,
  callback: (conversations: Conversation[]) => void
): () => void {
  // If user is guest or not logged in, provide local conversations
  if (!userId) {
    callback(getLocalConversations());
    return () => {};
  }

  const colRef = collection(db, 'conversations');
  const q = query(
    colRef,
    where('participants', 'array-contains', userId)
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const convs: Conversation[] = [];
      snapshot.forEach((d) => {
        convs.push(d.data() as Conversation);
      });

      // Merge with local conversations to ensure nothing is missed
      const local = getLocalConversations().filter(
        (c) => c.participants.includes(userId)
      );

      const map = new Map<string, Conversation>();
      local.forEach((c) => map.set(c.id, c));
      convs.forEach((c) => map.set(c.id, c));

      const merged = Array.from(map.values()).sort(
        (a, b) => b.lastMessageTime - a.lastMessageTime
      );

      callback(merged);
    },
    (err) => {
      console.warn('Conversations snapshot hatası, yerel veriler sunuluyor:', err);
      callback(getLocalConversations().filter((c) => c.participants.includes(userId)));
    }
  );

  return unsubscribe;
}

/**
 * Subscribes to messages of a single conversation thread.
 */
export function subscribeToConversationMessages(
  conversationId: string,
  callback: (messages: ChatMessage[]) => void
): () => void {
  if (!conversationId) {
    callback([]);
    return () => {};
  }

  const colRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(colRef, orderBy('createdAt', 'asc'));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((d) => {
        msgs.push(d.data() as ChatMessage);
      });

      const local = getLocalMessages(conversationId);
      const map = new Map<string, ChatMessage>();
      local.forEach((m) => map.set(m.id, m));
      msgs.forEach((m) => map.set(m.id, m));

      const merged = Array.from(map.values()).sort(
        (a, b) => a.createdAt - b.createdAt
      );

      callback(merged);
    },
    (err) => {
      console.warn('Messages snapshot hatası, yerel mesajlar sunuluyor:', err);
      callback(getLocalMessages(conversationId));
    }
  );

  return unsubscribe;
}

/**
 * Marks a conversation as read by the specified user (clearing unread flags).
 */
export async function markConversationAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  if (!conversationId || !userId) return;

  // 1. Update in local storage
  try {
    const local = getLocalConversations();
    const target = local.find((c) => c.id === conversationId);
    if (target) {
      if (target.sellerId === userId) target.unreadBySeller = false;
      if (target.buyerId === userId) target.unreadByBuyer = false;
      saveLocalConversation(target);
    }
  } catch (e) {
    console.warn('Local storage unread update error:', e);
  }

  // 2. Update in Firestore
  try {
    const convRef = doc(db, 'conversations', conversationId);
    const snap = await getDoc(convRef);
    if (snap.exists()) {
      const data = snap.data();
      const updates: any = {};
      if (data.sellerId === userId && data.unreadBySeller) {
        updates.unreadBySeller = false;
      }
      if (data.buyerId === userId && data.unreadByBuyer) {
        updates.unreadByBuyer = false;
      }
      if (Object.keys(updates).length > 0) {
        await updateDoc(convRef, updates);
      }
    }
  } catch (err) {
    console.warn('Firestore markConversationAsRead hatası:', err);
  }
}
