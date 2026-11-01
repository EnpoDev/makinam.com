import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  Search,
  ChevronRight,
  ShieldCheck,
  User,
  Clock,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  Conversation,
  ChatMessage,
  subscribeToUserConversations,
  subscribeToConversationMessages,
  sendReplyMessage
} from '../lib/messageService';
import { handleImageFallback } from '../utils/image';

export const MessagesPage: React.FC = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialConvId = searchParams.get('c') || '';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string>(initialConvId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [isSendingReply, setIsSendingReply] = useState<boolean>(false);
  const [filterTab, setFilterTab] = useState<'all' | 'buying' | 'selling'>('all');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = user?.uid || 'guest_user';
  const currentUserName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Kullanıcı';

  // 1. Subscribe to conversations
  useEffect(() => {
    const unsubscribe = subscribeToUserConversations(currentUserId, (convs) => {
      setConversations(convs);
      if (!selectedConversationId && convs.length > 0) {
        setSelectedConversationId(convs[0].id);
      }
    });

    return () => unsubscribe();
  }, [currentUserId]);

  // 2. Subscribe to messages of active conversation
  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    const unsubscribe = subscribeToConversationMessages(
      selectedConversationId,
      (msgs) => {
        setMessages(msgs);
      }
    );

    return () => unsubscribe();
  }, [selectedConversationId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConversation) return;

    setIsSendingReply(true);
    const textToSend = replyText.trim();
    setReplyText('');

    try {
      await sendReplyMessage({
        conversation: activeConversation,
        sender: {
          id: currentUserId,
          name: currentUserName
        },
        text: textToSend
      });
    } catch (err) {
      console.error('Mesaj yanıtlama hatası:', err);
      setReplyText(textToSend);
    } finally {
      setIsSendingReply(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    if (filterTab === 'buying' && c.buyerId !== currentUserId) return false;
    if (filterTab === 'selling' && c.sellerId !== currentUserId) return false;

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        c.listingTitle.toLowerCase().includes(q) ||
        c.sellerName.toLowerCase().includes(q) ||
        c.buyerName.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const formatMessageTime = (timestamp: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-[#f1f4f8] py-4 font-sans text-[#1e293b]">
      <div className="max-w-[1240px] mx-auto px-3">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#64748b] mb-3">
          <Link to="/" className="hover:text-[#ea580c]">Ana Sayfa</Link>
          <ChevronRight size={12} className="text-[#94a3b8]" />
          <Link to="/hesabim/ilanlarim" className="hover:text-[#ea580c]">Hesabım</Link>
          <ChevronRight size={12} className="text-[#94a3b8]" />
          <span className="text-[#1e293b] font-bold">Mesajlarım</span>
        </div>

        {/* MAIN CHAT APPLICATION CONTAINER */}
        <div className="bg-white border border-[#cbd5e1] rounded-[4px] shadow-sm overflow-hidden h-[720px] flex flex-col md:flex-row">
          
          {/* ========================================================= */}
          {/* LEFT PANEL: CONVERSATIONS LIST */}
          {/* ========================================================= */}
          <div className="w-full md:w-[360px] border-r border-[#e2e8f0] flex flex-col h-full bg-[#f8fafc] shrink-0">
            {/* Header */}
            <div className="p-3 border-b border-[#e2e8f0] bg-white">
              <div className="flex items-center justify-between mb-2.5">
                <h1 className="font-bold text-[14px] text-[#1e293b] flex items-center gap-1.5">
                  <MessageSquare size={16} className="text-[#ea580c]" />
                  <span>Mesajlarım</span>
                </h1>
                <span className="text-[11px] font-bold text-[#64748b] bg-gray-100 px-2 py-0.5 rounded-full">
                  {conversations.length} Konuşma
                </span>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-1 text-[11px] font-semibold bg-[#f1f5f9] p-0.5 rounded-[3px] mb-2">
                <button
                  onClick={() => setFilterTab('all')}
                  className={`flex-1 py-1 rounded-[2px] transition-colors ${
                    filterTab === 'all'
                      ? 'bg-white text-[#ea580c] shadow-2xs font-bold'
                      : 'text-[#64748b] hover:text-[#1e293b]'
                  }`}
                >
                  Tümü
                </button>
                <button
                  onClick={() => setFilterTab('buying')}
                  className={`flex-1 py-1 rounded-[2px] transition-colors ${
                    filterTab === 'buying'
                      ? 'bg-white text-[#ea580c] shadow-2xs font-bold'
                      : 'text-[#64748b] hover:text-[#1e293b]'
                  }`}
                >
                  Alıcı Olarak
                </button>
                <button
                  onClick={() => setFilterTab('selling')}
                  className={`flex-1 py-1 rounded-[2px] transition-colors ${
                    filterTab === 'selling'
                      ? 'bg-white text-[#ea580c] shadow-2xs font-bold'
                      : 'text-[#64748b] hover:text-[#1e293b]'
                  }`}
                >
                  Satıcı Olarak
                </button>
              </div>

              {/* Search in conversations */}
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-2.5 text-[#94a3b8]" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="İlan başlığı veya kişi ara..."
                  className="w-full h-[30px] pl-7 pr-3 text-[11.5px] border border-[#cbd5e1] rounded-[3px] bg-white focus:outline-none focus:border-[#ea580c]"
                />
              </div>
            </div>

            {/* Conversation List Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#f1f5f9]">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-[#64748b]">
                  <MessageSquare size={28} className="text-[#cbd5e1] mx-auto mb-2" />
                  <p className="text-[12px] font-bold text-[#475569]">Mesaj Bulunamadı</p>
                  <p className="text-[10.5px] text-[#94a3b8] mt-0.5">
                    İlan detay sayfalarındaki "Satıcıya Mesaj Gönder" butonunu kullanarak satıcılarla iletişim kurabilirsiniz.
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = conv.id === selectedConversationId;
                  const isUserBuyer = conv.buyerId === currentUserId;
                  const otherPartyName = isUserBuyer ? conv.sellerName : conv.buyerName;
                  const roleLabel = isUserBuyer ? 'Satıcı' : 'Alıcı';

                  return (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConversationId(conv.id)}
                      className={`p-3 cursor-pointer transition-colors relative flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-orange-50/70 border-l-3 border-[#ea580c]'
                          : 'hover:bg-white bg-[#f8fafc]'
                      }`}
                    >
                      <img
                        src={conv.listingImage}
                        alt={conv.listingTitle}
                        onError={handleImageFallback}
                        className="w-12 h-10 object-cover rounded-[2px] border border-[#cbd5e1] shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="font-bold text-[12px] text-[#1e293b] truncate">
                            {otherPartyName}
                          </span>
                          <span className="text-[10px] text-[#94a3b8] shrink-0 font-mono">
                            {formatMessageTime(conv.lastMessageTime)}
                          </span>
                        </div>

                        <div className="text-[10.5px] text-[#0284c7] font-semibold truncate mb-1">
                          {conv.listingTitle}
                        </div>

                        <p className="text-[11px] text-[#64748b] truncate leading-tight">
                          {conv.lastSenderId === currentUserId ? 'Siz: ' : ''}
                          {conv.lastMessage}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT PANEL: ACTIVE CHAT THREAD */}
          {/* ========================================================= */}
          <div className="flex-1 flex flex-col h-full bg-white">
            {activeConversation ? (
              <>
                {/* Active Chat Top Bar */}
                <div className="p-3 border-b border-[#e2e8f0] bg-white flex items-center justify-between shrink-0 shadow-2xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={activeConversation.listingImage}
                      alt={activeConversation.listingTitle}
                      onError={handleImageFallback}
                      className="w-12 h-9 object-cover rounded-[2px] border border-[#cbd5e1] shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-[13px] text-[#1e293b] truncate">
                          {activeConversation.listingTitle}
                        </h2>
                        <span className="text-[12px] font-black text-[#b91c1c] shrink-0">
                          {activeConversation.listingPrice.toLocaleString('tr-TR')} {activeConversation.listingCurrency}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#64748b] flex items-center gap-2 mt-0.5">
                        <span>İlgili Kişi: <strong className="text-[#334155]">{activeConversation.buyerId === currentUserId ? activeConversation.sellerName : activeConversation.buyerName}</strong></span>
                        <span>•</span>
                        <Link
                          to={`/ilan/${activeConversation.listingId}`}
                          className="text-[#0284c7] hover:underline flex items-center gap-0.5 font-semibold"
                        >
                          <span>İlanı İncele</span>
                          <ExternalLink size={10} />
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-1.5 text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 shrink-0">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    <span>Güvenli Mesajlaşma</span>
                  </div>
                </div>

                {/* Messages Bubbles Area */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f8fafc]/50">
                  {/* Safety reminder pill */}
                  <div className="max-w-[420px] mx-auto p-2 bg-amber-50 border border-amber-200 rounded-[3px] text-[10.5px] text-amber-800 text-center">
                    Makinayı fiziki olarak görmeden veya <strong>Makinam Güvende</strong> havuz sistemi haricinde şahsi hesaplara kapora göndermeyiniz.
                  </div>

                  {messages.map((msg) => {
                    const isMine = msg.senderId === currentUserId;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-[6px] px-3.5 py-2 shadow-2xs text-[12px] leading-relaxed ${
                            isMine
                              ? 'bg-[#19324d] text-white rounded-br-none'
                              : 'bg-white text-[#1e293b] border border-[#cbd5e1] rounded-bl-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                          <div
                            className={`text-[9.5px] mt-1 text-right font-mono ${
                              isMine ? 'text-slate-300' : 'text-[#94a3b8]'
                            }`}
                          >
                            {formatMessageTime(msg.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Reply Input Bar */}
                <form
                  onSubmit={handleSendReply}
                  className="p-3 border-t border-[#e2e8f0] bg-white flex items-center gap-2 shrink-0"
                >
                  <input
                    type="text"
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Yanıtınızı yazınız..."
                    className="flex-1 h-[38px] px-3.5 text-[12px] border border-[#cbd5e1] rounded-[3px] bg-white focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-orange-200"
                  />
                  <button
                    type="submit"
                    disabled={isSendingReply || !replyText.trim()}
                    className="h-[38px] px-4 bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-50 text-white text-[12px] font-bold rounded-[3px] flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    {isSendingReply ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Gönder</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* No Conversation Selected */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#64748b]">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3 text-[#94a3b8]">
                  <MessageSquare size={32} />
                </div>
                <h3 className="font-bold text-[15px] text-[#1e293b]">Konuşma Seçiniz</h3>
                <p className="text-[12px] text-[#64748b] max-w-[320px] mt-1">
                  Mesaj detaylarını ve geçmişini görüntülemek için sol taraftaki listeden bir ilanı seçiniz.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
