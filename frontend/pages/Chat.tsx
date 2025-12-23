import React, { useState, useRef, useEffect } from 'react';
import { Send, Search, MoreVertical, Paperclip, Smile, ChevronLeft, FileText, Image as ImageIcon, Lock, Unlock, Clock, Check, CheckCheck, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { messagingService, Message, Conversation } from '../services/messaging';
import { encryptionService } from '../services/encryption';
import CryptoJS from 'crypto-js';

const Chat: React.FC = () => {
  const { user } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [queuedNotification, setQueuedNotification] = useState<string | null>(null);

  // Encryption State
  const [myKeys, setMyKeys] = useState<{ publicKey: string; privateKey: string } | null>(null);
  const [canEncrypt, setCanEncrypt] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Protection contre undefined
  const activeChat = conversations?.find(c => c.id === selectedChatId) || null;

  const EMOJIS = ['😀', '😂', '😅', '😍', '🥰', '😎', '🤔', '😴', '😭', '🤯', '👍', '👎', '👋', '🙏', '🎉', '🔥', '❤️', '💔', '✨', '🚀', '💯', '💩', '👻', '🙈'];

  // Check encryption capability
  useEffect(() => {
    if (activeChat && myKeys && user) {
      const participants = activeChat.participants;
      const others = participants.filter(p => p.id !== user.id);
      const possible = others.every(p => p.profile.public_key);
      setCanEncrypt(possible);
    } else {
      setCanEncrypt(false);
    }
  }, [activeChat, myKeys, user]);

  // Initialiser le chiffrement
  useEffect(() => {
    const initCrypto = async () => {
      if (user) {
        try {
          const keys = await encryptionService.initializeEncryption();
          setMyKeys(keys);
        } catch (error) {
          console.error('Erreur initialisation chiffrement', error);
        }
      }
    };
    initCrypto();
  }, [user]);

  // Charger les conversations
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Charger les messages quand une conversation est sélectionnée
  useEffect(() => {
    if (selectedChatId) {
      loadMessages(selectedChatId);
    }
  }, [selectedChatId]);

  // WebSocket Connection
  useEffect(() => {
    let socket: WebSocket | null = null;

    if (selectedChatId && user) {
      socket = messagingService.connectToChat(selectedChatId.toString(), (newMessage) => {
        setMessages(prev => {
          // Éviter les doublons
          if (prev.some(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });

        // Mettre à jour la conversation
        setConversations(prev => prev.map(c => {
          if (c.id === selectedChatId) {
            return {
              ...c,
              last_message: newMessage,
              last_message_at: newMessage.created_at,
              unread_count: 0
            };
          }
          return c;
        }));
      });
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [selectedChatId]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await messagingService.getConversations();
      // S'assurer que data et data.results existent
      setConversations(data && Array.isArray(data.results) ? data.results : []);
    } catch (error) {
      console.error('Failed to load conversations', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const data = await messagingService.getMessages(conversationId.toString());
      setMessages(data && Array.isArray(data.results) ? data.results : []);
    } catch (error) {
      console.error('Failed to load messages', error);
      setMessages([]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!messageInput.trim() && attachments.length === 0) || !selectedChatId || !user) return;

    try {
      setSending(true);

      // Upload des fichiers si présents
      const uploadedAttachments = [];
      for (const file of attachments) {
        const uploaded = await messagingService.uploadFile(file);
        uploadedAttachments.push(uploaded);
      }

      // Chiffrement du message
      let contentToSend = messageInput;
      let isEncrypted = false;
      let encryptedKeys: Record<string, string> = {};

      if (myKeys && activeChat) {
        try {
          // Vérifier si les participants ont des clés publiques
          const participants = activeChat.participants;
          // Use string comparison for Hashids
          const others = participants.filter(p => p.id !== user.id);

          console.log('🔐 Vérification du chiffrement:');
          console.log('  - Mes clés:', myKeys ? 'Présentes' : 'Absentes');
          console.log('  - Autres participants:', others.length);
          others.forEach((p, i) => {
            console.log(`  - Participant ${i + 1}:`, p.profile.name);
            console.log(`    - public_key:`, p.profile.public_key ? 'Présente ✓' : 'Absente ✗');
          });

          // On peut chiffrer si j'ai mes clés et que les autres ont leurs clés publiques
          // Note: Pour l'instant on ne chiffre que si tout le monde a une clé.
          // En production, on pourrait avoir un mode hybride ou avertir l'utilisateur.
          const canEncrypt = others.every(p => p.profile.public_key);
          console.log('  - Chiffrement possible:', canEncrypt ? 'OUI ✓' : 'NON ✗');

          if (canEncrypt) {
            const aesKey = encryptionService.generateAESKey();
            contentToSend = encryptionService.encryptContent(messageInput, aesKey);
            isEncrypted = true;

            // Chiffrer la clé AES pour moi
            encryptedKeys[user.id] = encryptionService.encryptAESKey(aesKey, myKeys.publicKey);

            // Chiffrer la clé AES pour les autres participants
            others.forEach(p => {
              if (p.profile.public_key) {
                encryptedKeys[p.id] = encryptionService.encryptAESKey(aesKey, p.profile.public_key);
              }
            });
          }
        } catch (e) {
          console.error("Encryption failed", e);
          isEncrypted = false;
          contentToSend = messageInput;
        }
      }

      // Envoyer le message
      const newMessage = await messagingService.sendMessage(
        selectedChatId.toString(),
        contentToSend,
        uploadedAttachments,
        isEncrypted,
        encryptedKeys
      );

      // Ajouter le message à la liste (si pas déjà ajouté par WS)
      setMessages(prev => {
        if (prev.some(m => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });

      // Mettre à jour la conversation
      setConversations(prev => prev.map(conv => {
        if (conv.id === selectedChatId) {
          return {
            ...conv,
            last_message: newMessage,
            last_message_at: newMessage.created_at
          };
        }
        return conv;
      }));

      // Notification si message en attente
      if (newMessage.is_visible_to_recipient === false || (newMessage as any).queued) {
        const msg = (newMessage as any).queued_message ||
          "Votre message sera délivré au destinataire lors de votre prochain rendez-vous.";
        setQueuedNotification(msg);
        // Auto-dismiss après 5 secondes
        setTimeout(() => setQueuedNotification(null), 5000);
      }

      setMessageInput('');
      setAttachments([]);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Failed to send message', error);
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const addEmoji = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon size={16} />;
    return <FileText size={16} />;
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100dvh-140px)] bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Connectez-vous pour accéder aux messages</h2>
        <Link to="/login" className="bg-edu-secondary text-white px-6 py-2 rounded-full">Se connecter</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-140px)] bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edu-secondary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden h-[calc(100dvh-140px)] flex animate-in fade-in duration-300 relative">

      {/* Toast notification pour les messages en attente */}
      {queuedNotification && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-4 py-3 rounded-xl shadow-lg border border-amber-200 dark:border-amber-700 max-w-md">
            <Clock size={20} className="shrink-0" />
            <p className="text-sm font-medium">{queuedNotification}</p>
            <button
              onClick={() => setQueuedNotification(null)}
              className="ml-2 p-1 hover:bg-amber-200 dark:hover:bg-amber-800 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Sidebar - List of Conversations */}
      <div className={`flex-col w-full md:w-80 lg:w-96 border-r border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 h-full z-10 ${selectedChatId ? 'hidden md:flex' : 'flex'}`}>

        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-edu-primary dark:text-white">Messages</h2>
            <button className="bg-edu-secondary p-2 rounded-full text-white hover:bg-edu-primary transition-colors shadow-md">
              <MoreVertical size={18} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-edu-secondary dark:text-white"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-grow overflow-y-auto">
          {(conversations || []).length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p>Aucune conversation pour le moment</p>
            </div>
          ) : (
            (conversations || []).map(chat => {
              const otherParticipant = chat.participants.find(p => p.id !== user.id) || chat.participants[0];
              return (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className={`p-4 flex items-center gap-3 cursor-pointer transition-colors border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${selectedChatId === chat.id ? 'bg-blue-50 dark:bg-gray-700 border-l-4 border-l-edu-secondary' : 'border-l-4 border-l-transparent'}`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={otherParticipant.profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant.profile.name)}&background=random`}
                      alt={otherParticipant.profile.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">{otherParticipant.profile.name}</h3>
                      <span className="text-xs text-gray-400 shrink-0 ml-2">
                        {chat.last_message_at ? new Date(chat.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate pr-2">
                        {chat.last_message?.content || 'Aucun message'}
                      </p>
                      {chat.unread_count > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center shrink-0 animate-pulse shadow-sm">
                          {chat.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedChatId && activeChat ? (
        <div className={`flex-col w-full md:flex-grow h-full bg-white dark:bg-gray-800 ${selectedChatId ? 'flex animate-in slide-in-from-right duration-300' : 'hidden md:flex'}`}>

          {/* Chat Header */}
          <div className="p-3 md:p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 shrink-0 z-20">
            <div className="flex items-center gap-3 overflow-hidden">
              <button
                onClick={() => setSelectedChatId(null)}
                className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Retour"
              >
                <ChevronLeft size={24} />
              </button>
              {(() => {
                const otherParticipant = activeChat.participants.find(p => p.id !== user.id) || activeChat.participants[0];
                return (
                  <>
                    <div className="relative shrink-0">
                      <img
                        src={otherParticipant.profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant.profile.name)}&background=random`}
                        alt={otherParticipant.profile.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm md:text-base">{otherParticipant.profile.name}</h3>
                      <span className="text-xs text-gray-400">
                        {otherParticipant.email}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              <button className="p-2 text-gray-400 hover:text-edu-secondary hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/30 scroll-smooth">
            {messages.map(msg => {
              const isMe = msg.sender.id === user.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm text-sm md:text-base ${isMe
                    ? 'bg-edu-secondary text-white rounded-tr-none'
                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-600'
                    }`}>
                    {msg.content && (
                      <p className="break-words">
                        {!isMe && msg.is_visible_to_recipient === false ? (
                          <span className="italic opacity-70 flex items-center gap-2 text-sm">
                            <Lock size={14} />
                            Message en attente du rendez-vous
                          </span>
                        ) : msg.is_encrypted ? (
                          (() => {
                            try {
                              if (!myKeys) return (
                                <span className="italic opacity-70 flex items-center gap-1 text-xs">
                                  <Lock size={12} />
                                  Initialisation des clés...
                                </span>
                              );

                              // Find my encrypted AES key
                              const myEncryptedKey = msg.encrypted_keys?.[user.id];
                              if (!myEncryptedKey) {
                                // Fallback for old manual encryption (if any) or error
                                return (
                                  <span className="italic opacity-70 flex items-center gap-1 text-xs">
                                    <Lock size={12} />
                                    Message sécurisé (Clé manquante)
                                  </span>
                                );
                              }

                              // Decrypt AES key
                              const aesKey = encryptionService.decryptAESKey(myEncryptedKey, myKeys.privateKey);
                              if (!aesKey) throw new Error("Failed to decrypt AES key");

                              // Decrypt content
                              const originalText = encryptionService.decryptContent(msg.content!, aesKey);
                              if (!originalText) throw new Error("Decryption failed");

                              return (
                                <span>
                                  <Lock size={12} className="inline mr-1 mb-0.5 text-green-500" />
                                  {originalText}
                                </span>
                              );
                            } catch (e) {
                              return (
                                <span className="italic opacity-70 flex items-center gap-1 text-xs">
                                  <Lock size={12} />
                                  Message sécurisé (Indéchiffrable)
                                </span>
                              );
                            }
                          })()
                        ) : (
                          msg.content
                        )}
                      </p>
                    )}

                    {/* Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (!(!isMe && msg.is_visible_to_recipient === false)) && (
                      <div className="mt-2 space-y-2">
                        {msg.attachments.map(att => (
                          <a
                            key={att.id}
                            href={att.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 p-2 rounded-lg ${isMe ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-600'
                              }`}
                          >
                            {getFileIcon(att.file_type)}
                            <div className="flex-grow min-w-0">
                              <p className="text-xs truncate">{att.file_name}</p>
                              <p className="text-[10px] opacity-70">{formatFileSize(att.file_size)}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}

                    <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'} flex items-center justify-end gap-1`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {isMe && (
                        <>
                          {msg.is_visible_to_recipient === false ? (
                            <span title="En attente du prochain rendez-vous" className="text-yellow-300">
                              <Clock size={12} />
                            </span>
                          ) : (
                            <span title="Envoyé" className="text-blue-100">
                              <CheckCheck size={14} />
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 md:p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shrink-0 relative">
            {showEmojiPicker && (
              <div ref={emojiPickerRef} className="absolute bottom-20 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-3 grid grid-cols-6 gap-2 w-64 h-48 overflow-y-auto z-50 animate-in zoom-in-95 duration-200">
                {EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => addEmoji(emoji)}
                    className="text-xl p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                    {getFileIcon(file.type)}
                    <span className="text-xs truncate max-w-[150px]">{file.name}</span>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
              <div className="flex gap-1 mb-2 shrink-0">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-edu-secondary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <Paperclip size={20} />
                </button>
              </div>
              <div className={`flex-grow bg-gray-100 dark:bg-gray-900 rounded-2xl flex items-center px-3 py-2 focus-within:ring-2 ${canEncrypt ? 'focus-within:ring-green-500/50 focus-within:border-green-500' : 'focus-within:ring-yellow-500/50 focus-within:border-yellow-500'} border border-transparent transition-all`}>
                {canEncrypt ? (
                  <div title="Chiffrement de bout en bout actif">
                    <Lock size={16} className="text-green-500 mr-2" />
                  </div>
                ) : (
                  <div title="Chiffrement inactif (Destinataire sans clés)">
                    <Unlock size={16} className="text-yellow-500 mr-2" />
                  </div>
                )}
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={canEncrypt ? "Message chiffré..." : "Message non chiffré (Destinataire sans clés)..."}
                  className="flex-grow bg-transparent outline-none text-sm dark:text-white max-h-32 py-1"
                />
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`text-gray-400 hover:text-edu-secondary ml-1 shrink-0 transition-colors ${showEmojiPicker ? 'text-edu-secondary' : ''}`}
                >
                  <Smile size={20} />
                </button>
              </div>
              <button
                type="submit"
                disabled={(!messageInput.trim() && attachments.length === 0) || sending}
                className={`${canEncrypt ? 'bg-edu-secondary hover:bg-edu-primary' : 'bg-yellow-500 hover:bg-yellow-600'} text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:shadow-none shrink-0`}
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Send size={20} />
                )}
              </button>
            </form>
          </div>

        </div>
      ) : (
        /* Empty State (Desktop only) */
        <div className="hidden md:flex flex-grow flex-col items-center justify-center text-center p-8 bg-gray-50/30 dark:bg-gray-900/20">
          <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <div className="opacity-20"><MoreVertical size={48} /></div>
            <div className="absolute text-edu-secondary opacity-50"><Send size={32} /></div>
          </div>
          <h2 className="text-2xl font-bold text-edu-primary dark:text-white mb-2">Vos messages</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xs">
            Sélectionnez une conversation dans la liste de gauche pour commencer à discuter avec vos mentors ou camarades.
          </p>
        </div>
      )}
    </div>
  );
};

export default Chat;