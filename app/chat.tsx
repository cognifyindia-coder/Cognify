import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Platform, Keyboard, Animated, Image, ScrollView, ActivityIndicator, Modal, KeyboardAvoidingView, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { supabase } from '../supabase/utils/supabase';

const MessageSkeletonLoader = () => (
    <View style={{ padding: 12, gap: 12 }}>
        {[1, 2, 3, 4].map((i) => (
            <View key={i} style={{ flexDirection: i % 2 === 0 ? 'row-reverse' : 'row', paddingHorizontal: 8 }}>
                <View
                    style={{
                        maxWidth: '70%',
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 12,
                        backgroundColor: '#1A1E2E',
                        minHeight: 40,
                    }}
                />
            </View>
        ))}
    </View>
);

const ConversationSkeletonLoader = () => (
    <View style={{ paddingHorizontal: 0, paddingVertical: 0 }}>
        {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={{ flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 12, paddingRight: 8, alignItems: 'center', borderBottomColor: '#1F2937', borderBottomWidth: 1 }}>
                <View
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: '#1A1E2E',
                        marginRight: 10,
                    }}
                />
                <View style={{ flex: 1 }}>
                    <View style={{ height: 16, backgroundColor: '#1A1E2E', borderRadius: 4, marginBottom: 8, width: '70%' }} />
                    <View style={{ height: 12, backgroundColor: '#1A1E2E', borderRadius: 4, width: '90%' }} />
                </View>
            </View>
        ))}
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0F0F',
    },
    breadcrumb: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomColor: '#1F2937',
        borderBottomWidth: 1,
    },
    breadcrumbText: {
        color: '#A8ADB5',
        fontSize: 12,
        fontWeight: '500',
    },
    breadcrumbSeparator: {
        color: '#A8ADB5',
        marginHorizontal: 6,
    },
    breadcrumbActive: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomColor: '#1F2937',
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuButton: {
        padding: 8,
    },
    avatarButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#B596D4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    chatContent: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    messageContainer: {
        marginVertical: 8,
    },
    assistantMessageWithAvatar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
    },
    assistantAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#B596D4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    assistantAvatarText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    userMessage: {
        alignSelf: 'flex-end',
        maxWidth: '80%',
        backgroundColor: '#1D60E0',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    assistantMessage: {
        maxWidth: '80%',
        backgroundColor: '#000000',
        borderColor: '#3A3F4F',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    messageText: {
        color: '#FFFFFF',
        fontSize: 14,
        lineHeight: 20,
    },
    codeBlock: {
        backgroundColor: '#0F0F0F',
        borderRadius: 6,
        padding: 12,
        marginVertical: 8,
        fontFamily: 'Courier New',
        fontSize: 12,
        color: '#FFFFFF',
    },
    listItem: {
        marginLeft: 16,
        marginVertical: 6,
        lineHeight: 20,
        color: '#FFFFFF',
        fontSize: 14,
    },
    heading: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 12,
        marginBottom: 8,
        color: '#FFFFFF',
    },
    bottomTabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#0F0F0F',
        borderTopColor: '#1F2937',
        borderTopWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 0,
        gap: 0,
    },
    bottomTab: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    bottomTabActive: {
        borderBottomColor: '#1D60E0',
    },
    bottomTabText: {
        color: '#A8ADB5',
        fontSize: 14,
        fontWeight: '500',
    },
    bottomTabTextActive: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    messagesContainer: {
        flex: 1,
        backgroundColor: '#0F0F0F',
    },
    messagesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomColor: '#1F2937',
        borderBottomWidth: 1,
    },
    messagesHeaderTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    headerButton: {
        padding: 8,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomColor: '#1F2937',
        borderBottomWidth: 1,
    },
    searchInput: {
        backgroundColor: '#1A1E2E',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        color: '#FFFFFF',
        fontSize: 14,
        borderColor: '#3A3F4F',
        borderWidth: 1,
    },
    conversationsList: {
        flex: 1,
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
    conversationItem: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 12,
        paddingRight: 8,
        marginVertical: 0,
        marginHorizontal: 0,
        borderRadius: 0,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: 0,
        borderBottomColor: '#1F2937',
        borderBottomWidth: 1,
        alignItems: 'center',
    },
    conversationAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#B596D4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        flexShrink: 0,
    },
    conversationAvatarText: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '700',
    },
    conversationContent: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    conversationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: -4,
        gap: 12,
    },
    conversationName: {
        fontSize: 15,
        fontWeight: '500',
        color: '#FFFFFF',
        flex: 1,
        lineHeight: 18,
    },
    conversationTime: {
        fontSize: 12,
        color: '#9CA3AF',
        flexShrink: 0,
        lineHeight: 18,
    },
    conversationMessage: {
        fontSize: 13,
        color: '#9CA3AF',
        lineHeight: 18,
    },
    unreadBadge: {
        backgroundColor: 'transparent',
        borderRadius: 4,
        width: 8,
        height: 8,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    unreadBadgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },
    newMessageButton: {
        backgroundColor: '#1D60E0',
        marginHorizontal: 16,
        marginVertical: 16,
        paddingVertical: 14,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    newMessageButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    conversationViewContainer: {
        flex: 1,
        backgroundColor: '#0F0F0F',
    },
    conversationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 1,
        paddingVertical: 4,
        borderBottomColor: 'transparent',
        borderBottomWidth: 0,
    },
    conversationHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    conversationBackButton: {
        padding: 8,
    },
    conversationHeaderInfo: {
        justifyContent: 'center',
    },
    conversationHeaderName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    conversationHeaderUsername: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 0,
    },
    conversationMessagesView: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    messageRow: {
        marginVertical: 6,
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    userMessageRow: {
        justifyContent: 'flex-end',
    },
    messageBubble: {
        maxWidth: '85%',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
    },
    userMessageBubble: {
        backgroundColor: '#1D60E0',
        alignSelf: 'flex-end',
    },
    otherMessageBubble: {
        backgroundColor: '#000000',
        borderColor: '#3A3F4F',
        borderWidth: 1,
        alignSelf: 'flex-start',
    },
    messageBubbleText: {
        color: '#FFFFFF',
        fontSize: 14,
        lineHeight: 20,
    },
    messageTime: {
        fontSize: 11,
        color: '#6B7280',
        marginTop: 4,
    },
    conversationInputContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#0F0F0F',
        borderTopColor: '#1F2937',
        borderTopWidth: 1,
    },
    conversationInputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#1A1E2E',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        gap: 8,
        borderColor: '#3A3F4F',
        borderWidth: 1,
    },
    conversationInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 14,
        maxHeight: 100,
        paddingVertical: 6,
    },
    thinkingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    thinkingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#A8ADB5',
    },
    thinkingText: {
        color: '#A8ADB5',
        fontSize: 14,
        fontWeight: '500',
    },
    placeholderContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    promptText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    cursor: {
        color: '#1D60E0',
        fontWeight: '300',
    },
    inputContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        backgroundColor: '#0F0F0F',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#1A1E2E',
        borderColor: '#1D60E0',
        borderWidth: 1.5,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 8,
    },
    input: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'System',
        maxHeight: 100,
    },
    inputPlaceholder: {
        color: '#6B7280',
    },
    iconButton: {
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1A1E2E',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 30,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    modelItem: {
        paddingVertical: 12,
        paddingHorizontal: 14,
        backgroundColor: '#0F0F0F',
        borderRadius: 8,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#3A3F4F',
    },
    modelItemSelected: {
        backgroundColor: '#1D60E0',
        borderColor: '#1D60E0',
    },
    modelItemText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
    modelItemSubtext: {
        color: '#A8ADB5',
        fontSize: 12,
        marginTop: 4,
    },
});

interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
}

const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // Horizontal rules (---, ***, ___)
        if (line.match(/^\s*([-*_])\s*\1\s*\1(\s*\1)*\s*$/)) {
            elements.push(<View key={`hr-${i}`} style={{ height: 1, backgroundColor: '#3A3F4F', marginVertical: 12 }} />);
        }
        // Headers
        else if (line.match(/^#{1,6}\s/)) {
            const level = line.match(/^#+/)?.[0].length || 1;
            const content = line.replace(/^#+\s/, '');
            elements.push(
                <Text key={`heading-${i}`} style={styles.heading}>
                    {content}
                </Text>
            );
        }
        // Code blocks
        else if (line.trim().startsWith('```')) {
            const codeLines = [];
            i++;
            while (i < lines.length && !lines[i].trim().startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            elements.push(
                <Text key={`code-${i}`} style={styles.codeBlock}>
                    {codeLines.join('\n')}
                </Text>
            );
        }
        // Lists (but not horizontal rules that might start with -)
        else if ((line.match(/^\s*[-*+]\s/) || line.match(/^\s*\d+\.\s/)) && !line.match(/^\s*([-*_])\s*\1+/)) {
            const content = line.replace(/^\s*[-*+\d.]\s/, '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1');
            elements.push(
                <Text key={`list-${i}`} style={styles.listItem}>
                    • {content}
                </Text>
            );
        }
        // Regular paragraphs
        else if (line.trim()) {
            const content = line
                .replace(/\*\*([^*]+)\*\*/g, '$1')
                .replace(/\*([^*]+)\*/g, '$1')
                .replace(/`([^`]+)`/g, '$1');
            elements.push(
                <Text key={`para-${i}`} style={styles.messageText}>
                    {content}
                </Text>
            );
        }
        // Empty lines create spacing
        else if (elements.length > 0) {
            elements.push(<View key={`space-${i}`} style={{ height: 8 }} />);
        }

        i++;
    }

    return elements;
};

export default function ChatScreen() {
    const [message, setMessage] = useState('');
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [displayText, setDisplayText] = useState('');
    const [textIndex, setTextIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const fadeAnim = useState(new Animated.Value(1))[0];
    const buttonsOpacity = useState(new Animated.Value(1))[0];
    const buttonsScale = useState(new Animated.Value(1))[0];
    const conversationButtonsOpacity = useState(new Animated.Value(1))[0];
    const conversationButtonsScale = useState(new Animated.Value(1))[0];
    const insets = useSafeAreaInsets();
    const [profile, setProfile] = useState<any>({
        display_name: 'User',
        avatar_url: null,
    });
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const [settingsModalVisible, setSettingsModalVisible] = useState(false);
    const [selectedModel, setSelectedModel] = useState('');
    const [availableModels, setAvailableModels] = useState<any[]>([]);
    const [typingText, setTypingText] = useState('');
    const [displayedTyping, setDisplayedTyping] = useState('');
    const [dotAnimation] = useState(new Animated.Value(0));
    const abortControllerRef = useRef<AbortController | null>(null);
    const [activeTab, setActiveTab] = useState('AI');
    const [searchText, setSearchText] = useState('');
    const [selectedConversation, setSelectedConversation] = useState<any>(null);
    const [conversations, setConversations] = useState([
        { id: 1, name: 'Faraaz Siddiqui', username: '@frz', avatar: 'FS', lastMessage: 'Voice message', time: 'Fri', unread: 70, lastSeen: 'Last seen 18h ago' },
        { id: 2, name: 'Chichi Shees', username: '@chichi', avatar: 'CS', lastMessage: 'You: Jh', time: 'Nov 11', unread: 0, lastSeen: 'Last seen 2d ago' },
        { id: 3, name: 'asma siddiqui', username: '@asma', avatar: 'AS', lastMessage: 'You: Wtf', time: 'Nov 11', unread: 2, lastSeen: 'Last seen 5h ago' },
        { id: 4, name: 'try', username: '@try', avatar: 'US', lastMessage: 'No messages yet', time: '', unread: 0, lastSeen: 'Last seen 1d ago' },
    ]);
    const [conversationMessages, setConversationMessages] = useState<any[]>([]);
    const [conversationInputText, setConversationInputText] = useState('');
    const [selectedMessageIndex, setSelectedMessageIndex] = useState(-1);
    const [keyboardControlEnabled, setKeyboardControlEnabled] = useState(false);
    const [conversationMessagesLoading, setConversationMessagesLoading] = useState(false);
    const [conversationsLoading, setConversationsLoading] = useState(false);
    const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});
    const conversationMessagesRef = useRef<any[]>([]);
    const conversationScrollViewRef = useRef<ScrollView>(null);
    const conversationFetchAbortRef = useRef<AbortController | null>(null);
    const conversationCacheRef = useRef<{ [key: string]: any[] }>({});
    const conversationListCacheRef = useRef<any[] | null>(null);

    // Update ref when conversationMessages changes
    useEffect(() => {
        conversationMessagesRef.current = conversationMessages;
        // Scroll to bottom smoothly when new messages arrive
        setTimeout(() => {
            conversationScrollViewRef.current?.scrollToEnd({ animated: true });
        }, 50);
    }, [conversationMessages]);

    // Animate thinking dots
    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(dotAnimation, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: false,
                }),
                Animated.timing(dotAnimation, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: false,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, [dotAnimation]);

    const texts = [
        'What do you want to know',
        'Ask me anything',
        'How can I help you today',
        'Let\'s chat about anything',
        'What\'s on your mind',
    ];

    // Animate conversation buttons
    useEffect(() => {
        const animate = () => {
            if (conversationInputText.trim() === '') {
                Animated.parallel([
                    Animated.timing(conversationButtonsOpacity, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(conversationButtonsScale, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]).start();
            } else {
                Animated.parallel([
                    Animated.timing(conversationButtonsOpacity, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(conversationButtonsScale, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]).start();
            }
        };
        animate();
    }, [conversationInputText]);

    useEffect(() => {
        fetchUserProfile();
        // Fetch unread counts once on app load
        fetchUnreadCounts();
        
        // Set up notifications
        setupNotifications();
    }, []);

    const setupNotifications = async () => {
        try {
            // Request permissions
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                console.log('Notification permissions not granted');
                return;
            }

            // Set notification handler for foreground notifications
            Notifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldShowBanner: true,
                    shouldShowList: true,
                    shouldPlaySound: true,
                    shouldSetBadge: true,
                }),
            });

            // Get push notification token and save to backend
            try {
                const token = await Notifications.getExpoPushTokenAsync();
                console.log('Expo Push Token:', token.data);
                
                // Save token to Supabase for later push notifications
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase
                        .from('profiles')
                        .update({ push_token: token.data })
                        .eq('id', user.id);
                }
            } catch (error) {
                console.error('Failed to get push token:', error);
            }

            // Handle notification responses (when user taps notification)
            const subscription = Notifications.addNotificationResponseReceivedListener(response => {
                const conversationId = response.notification.request.content.data.conversationId;
                if (conversationId) {
                    const conversation = conversations.find(c => c.id === conversationId);
                    if (conversation) {
                        setSelectedConversation(conversation);
                        setActiveTab('Messages');
                    }
                }
            });

            return () => subscription.remove();
        } catch (error) {
            console.error('Error setting up notifications:', error);
        }
    };

    // Fetch conversations when Messages tab is active
    useEffect(() => {
        if (activeTab === 'Messages') {
            fetchConversations();
        }
    }, [activeTab]);

    // Global real-time subscription that always listens to messages
    useEffect(() => {
        const globalMessagesChannel = supabase
            .channel('global-messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                },
                async (payload: any) => {
                    const { data: { user } } = await supabase.auth.getUser();
                    
                    // If this is a message from another user
                    if (payload.new.sender_id !== user?.id) {
                        // Increment unread for this conversation
                        setUnreadCounts(prev => ({
                            ...prev,
                            [payload.new.conversation_id]: (prev[payload.new.conversation_id] || 0) + 1
                        }));
                        
                        // Show notification if not in this conversation
                        if (selectedConversation?.id !== payload.new.conversation_id) {
                            const conversation = conversations.find(c => c.id === payload.new.conversation_id);
                            await Notifications.scheduleNotificationAsync({
                                content: {
                                    title: conversation?.name || 'New Message',
                                    body: payload.new.content,
                                    data: { conversationId: payload.new.conversation_id },
                                    sound: 'default',
                                },
                                trigger: null,
                            });
                        }
                        
                        // Update conversation list with new last message
                        setConversations(prev => {
                            const updated = prev.map(conv => {
                                if (conv.id === payload.new.conversation_id) {
                                    return {
                                        ...conv,
                                        lastMessage: payload.new.content,
                                        time: new Date(payload.new.created_at).toLocaleDateString(),
                                    };
                                }
                                return conv;
                            });
                            // Update the cache with the new list
                            conversationListCacheRef.current = updated;
                            return updated;
                        });
                        
                        // Invalidate message cache for this conversation so it fetches fresh
                        delete conversationCacheRef.current[payload.new.conversation_id];
                    }
                }
            )
            .subscribe();
        
        return () => {
            supabase.removeChannel(globalMessagesChannel);
        };
    }, []);

    useEffect(() => {
        if (selectedConversation && selectedConversation.id) {
            fetchConversationMessages(selectedConversation.id);
            
            // Clear unread count for this conversation
            setUnreadCounts(prev => ({
                ...prev,
                [selectedConversation.id]: 0
            }));
            
            // Subscribe to real-time message updates for all conversations
            const allConvChannel = supabase
                .channel('all-messages')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'messages',
                    },
                    async (payload: any) => {
                        const { data: { user } } = await supabase.auth.getUser();
                        
                        // If message is in current conversation, add it to messages
                        if (payload.new.conversation_id === selectedConversation.id) {
                            const newMessage = {
                                id: payload.new.id,
                                text: payload.new.content,
                                sender: payload.new.sender_id === user?.id ? 'user' : 'other',
                                time: new Date(payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            };
                            setConversationMessages(prev => {
                                // Check if this is an optimistic message we already added
                                const optimisticIndex = prev.findIndex(msg => 
                                    msg.text === newMessage.text && msg.sender === newMessage.sender && msg.id.toString().startsWith('temp-')
                                );
                                
                                let updated;
                                if (optimisticIndex !== -1) {
                                    // Replace optimistic message with real one
                                    updated = [...prev];
                                    updated[optimisticIndex] = newMessage;
                                } else {
                                    // New message from another user
                                    updated = [...prev, newMessage];
                                }
                                
                                // Update cache
                                conversationCacheRef.current[selectedConversation.id] = updated;
                                return updated;
                            });
                        } else {
                            // For other conversations, increment unread count
                            if (payload.new.sender_id !== user?.id) {
                                setUnreadCounts(prev => ({
                                    ...prev,
                                    [payload.new.conversation_id]: (prev[payload.new.conversation_id] || 0) + 1
                                }));
                            }
                        }
                        
                        // Update conversation list with new last message
                        setConversations(prev => {
                            const updated = prev.map(conv => {
                                if (conv.id === payload.new.conversation_id) {
                                    return {
                                        ...conv,
                                        lastMessage: payload.new.content,
                                        time: new Date(payload.new.created_at).toLocaleDateString(),
                                    };
                                }
                                return conv;
                            });
                            // Update the cache with the new list
                            conversationListCacheRef.current = updated;
                            return updated;
                        });
                    }
                )
                .subscribe();
            
            return () => {
                // Unsubscribe when conversation changes or component unmounts
                supabase.removeChannel(allConvChannel);
            };
        }
    }, [selectedConversation]);

    useEffect(() => {
        const keyboardWillShow = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                setKeyboardHeight(e.endCoordinates.height);
            }
        );

        const keyboardWillHide = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
            }
        );

        return () => {
            keyboardWillShow.remove();
            keyboardWillHide.remove();
        };
    }, []);

    // Keyboard shortcuts handler for messages view
    useEffect(() => {
        const handleKeyDown = (e: any) => {
            // Only enable when in messages tab and conversation is selected
            if (activeTab !== 'Messages' || !selectedConversation) return;

            const msgCount = conversationMessagesRef.current.length;

            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedMessageIndex((prev) => Math.max(-1, prev - 1));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedMessageIndex((prev) => Math.min(msgCount - 1, prev + 1));
                    break;
                case 'j': // vim-style navigation
                    if (!e.ctrlKey && !e.metaKey && !e.altKey) {
                        setSelectedMessageIndex((prev) => Math.min(msgCount - 1, prev + 1));
                    }
                    break;
                case 'k': // vim-style navigation
                    if (!e.ctrlKey && !e.metaKey && !e.altKey) {
                        setSelectedMessageIndex((prev) => Math.max(-1, prev - 1));
                    }
                    break;
                case 'Escape':
                    setSelectedMessageIndex(-1);
                    Keyboard.dismiss();
                    break;
                case 'Enter':
                    if (e.ctrlKey || e.metaKey) {
                        // Cmd+Enter or Ctrl+Enter to send
                        if (conversationInputText.trim()) {
                            setConversationMessages([
                                ...conversationMessagesRef.current,
                                {
                                    id: conversationMessagesRef.current.length + 1,
                                    sender: 'user',
                                    text: conversationInputText,
                                    time: new Date().toLocaleTimeString(),
                                },
                            ]);
                            setConversationInputText('');
                        }
                    }
                    break;
            }
        };

        // For web/desktop support
        if (Platform.OS === 'web') {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [activeTab, selectedConversation, conversationInputText]);

    const fetchUserProfile = async () => {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                console.error('Auth error:', authError);
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('display_name, avatar_url, selected_models')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Profile fetch error:', error);
            } else if (data) {
                setProfile({
                    display_name: data.display_name || 'User',
                    avatar_url: data.avatar_url || null,
                });

                // Parse selected_models from database (JSONB)
                let models: string[] = [];
                if (data.selected_models) {
                    if (Array.isArray(data.selected_models)) {
                        models = data.selected_models as string[];
                    } else if (typeof data.selected_models === 'object') {
                        // If it's an object with model data, extract IDs
                        models = Object.keys(data.selected_models);
                    } else if (typeof data.selected_models === 'string') {
                        models = JSON.parse(data.selected_models);
                    }
                }

                // Map model IDs to model objects - extract provider from model ID format
                const mappedModels = models.map((modelId: string) => {
                    const trimmedId = modelId.trim();
                    const provider = trimmedId.split('/')[0] || 'Unknown';
                    const modelName = trimmedId.split('/')[1]?.split(':')[0] || trimmedId;

                    return {
                        id: trimmedId,
                        name: modelName.charAt(0).toUpperCase() + modelName.slice(1),
                        provider: provider.charAt(0).toUpperCase() + provider.slice(1),
                    };
                });

                setAvailableModels(mappedModels);

                // Set first model as selected
                if (models.length > 0) {
                    setSelectedModel(models[0].trim());
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const fetchUnreadCounts = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: conversations } = await supabase
                .from('conversations')
                .select('id')
                .eq('user_id', user.id);

            if (!conversations) return;

            const counts: { [key: string]: number } = {};

            for (const conv of conversations) {
                const { count } = await supabase
                    .from('messages')
                    .select('id', { count: 'exact' })
                    .eq('conversation_id', conv.id)
                    .not('read_by', 'cs', `{"${user.id}"}`)
                    .single();

                counts[conv.id] = count || 0;
            }

            setUnreadCounts(counts);
        } catch (error) {
            console.error('Error fetching unread counts:', error);
        }
    };

    const fetchConversations = async () => {
        try {
            // Check cache first
            if (conversationListCacheRef.current) {
                setConversations(conversationListCacheRef.current);
                return;
            }

            setConversationsLoading(true);
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                setConversationsLoading(false);
                return;
            }

            // Get conversations where user is a participant
            const { data: participantData, error: participantError } = await supabase
                .from('conversation_participants')
                .select('conversation_id')
                .eq('user_id', user.id);

            if (participantError) {
                console.error('Error fetching participants:', participantError);
                setConversationsLoading(false);
                return;
            }

            const conversationIds = participantData?.map(p => p.conversation_id) || [];
            
            if (conversationIds.length === 0) {
                setConversations([]);
                setConversationsLoading(false);
                return;
            }

            // Get conversation details with last message
            const { data: convData, error: convError } = await supabase
                .from('conversations')
                .select(`
                    id,
                    created_at,
                    conversation_participants(user_id),
                    messages(content, created_at, sender_id)
                `)
                .in('id', conversationIds)
                .order('created_at', { ascending: false });

            if (convError) {
                console.error('Error fetching conversations:', convError);
                setConversationsLoading(false);
                return;
            }

            // Process conversations to get other user's info
            const processedConversations = await Promise.all(
                (convData || []).map(async (conv: any) => {
                    const otherParticipants = conv.conversation_participants?.filter(
                        (p: any) => p.user_id !== user.id
                    ) || [];

                    if (otherParticipants.length === 0) return null;

                    const otherUserId = otherParticipants[0].user_id;
                    
                    // Get other user's profile
                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select('display_name, username, id, avatar_url')
                        .eq('id', otherUserId)
                        .single();

                    // Get the latest message from the conversation
                    const { data: latestMessageData } = await supabase
                        .from('messages')
                        .select('content, created_at, sender_id')
                        .eq('conversation_id', conv.id)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .single();

                    const lastMessage = latestMessageData;
                    const avatar = profileData?.display_name?.substring(0, 2).toUpperCase() || 'U';

                    return {
                        id: conv.id,
                        name: profileData?.display_name || 'User',
                        username: profileData?.username || '@user',
                        avatar: avatar,
                        avatarUrl: profileData?.avatar_url || null,
                        lastMessage: lastMessage?.content || 'No messages yet',
                        time: lastMessage?.created_at ? new Date(lastMessage.created_at).toLocaleDateString() : 'Now',
                        unread: 0,
                    };
                })
            );

            const filteredConversations = processedConversations.filter(c => c !== null);
            
            // Cache the conversations list
            conversationListCacheRef.current = filteredConversations;
            setConversations(filteredConversations);
            setConversationsLoading(false);
        } catch (error) {
            console.error('Error in fetchConversations:', error);
            setConversationsLoading(false);
        }
    };

    const fetchConversationMessages = async (conversationId: string) => {
        try {
            // Check cache first
            if (conversationCacheRef.current[conversationId]) {
                setConversationMessages(conversationCacheRef.current[conversationId]);
                return;
            }

            // Abort previous fetch if still in progress
            if (conversationFetchAbortRef.current) {
                conversationFetchAbortRef.current.abort();
            }
            
            // Create new abort controller for this fetch
            conversationFetchAbortRef.current = new AbortController();
            const signal = conversationFetchAbortRef.current.signal;
            
            setConversationMessagesLoading(true);
            
            const { data, error } = await supabase
                .from('messages')
                .select('id, sender_id, content, created_at, type')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            // Check if this fetch was aborted
            if (signal.aborted) {
                return;
            }

            if (error) {
                console.error('Error fetching messages:', error);
                setConversationMessagesLoading(false);
                return;
            }

            // Double-check conversation hasn't changed
            if (selectedConversation?.id !== conversationId) {
                setConversationMessagesLoading(false);
                return;
            }

            // Get current user to identify sender
            const { data: { user } } = await supabase.auth.getUser();

            // Format messages for display
            const formattedMessages = (data || []).map((msg: any) => ({
                id: msg.id,
                text: msg.content,
                sender: msg.sender_id === user?.id ? 'user' : 'other',
                time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }));

            // Cache the messages
            conversationCacheRef.current[conversationId] = formattedMessages;

            // Only update if we're still viewing the same conversation and fetch wasn't aborted
            if (selectedConversation?.id === conversationId && !signal.aborted) {
                setConversationMessages(formattedMessages);
            }
            
            setConversationMessagesLoading(false);
        } catch (error) {
            // Ignore abort errors
            if (error instanceof Error && error.name === 'AbortError') {
                return;
            }
            console.error('Error in fetchConversationMessages:', error);
            setConversationMessagesLoading(false);
        }
    };

    // Button transition animation
    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.timing(buttonsOpacity, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(buttonsScale, {
                    toValue: 0.9,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.timing(buttonsOpacity, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(buttonsScale, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, [message.trim() === '']);

    // Typing animation effect
    useEffect(() => {
        const currentText = texts[textIndex];

        const typingSpeed = isDeleting ? 50 : 100;
        const pauseEnd = 2000; // Pause at end of text
        const pauseBeforeDelete = 1500; // Pause before deleting

        if (!isDeleting && charIndex < currentText.length) {
            // Typing forward
            const timeout = setTimeout(() => {
                setDisplayText(currentText.substring(0, charIndex + 1));
                setCharIndex(charIndex + 1);
            }, typingSpeed);
            return () => clearTimeout(timeout);
        } else if (!isDeleting && charIndex === currentText.length) {
            // Finished typing, pause then start deleting
            const timeout = setTimeout(() => {
                setIsDeleting(true);
            }, pauseBeforeDelete);
            return () => clearTimeout(timeout);
        } else if (isDeleting && charIndex > 0) {
            // Deleting
            const timeout = setTimeout(() => {
                setDisplayText(currentText.substring(0, charIndex - 1));
                setCharIndex(charIndex - 1);
            }, typingSpeed);
            return () => clearTimeout(timeout);
        } else if (isDeleting && charIndex === 0) {
            // Finished deleting, move to next text
            setIsDeleting(false);
            setTextIndex((textIndex + 1) % texts.length);
        }
    }, [charIndex, isDeleting, textIndex, texts]);

    // Typing animation for AI responses
    useEffect(() => {
        if (!loading && typingText) {
            const typingSpeed = 15;
            if (displayedTyping.length < typingText.length) {
                const timeout = setTimeout(() => {
                    setDisplayedTyping(typingText.substring(0, displayedTyping.length + 1));
                }, typingSpeed);
                return () => clearTimeout(timeout);
            } else if (displayedTyping.length === typingText.length) {
                // Typing finished, add message
                const assistantMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    content: typingText,
                    role: 'assistant',
                };
                setMessages(prev => [...prev, assistantMsg]);
                setTypingText('');
                setDisplayedTyping('');
            }
        }
    }, [displayedTyping, typingText, loading]);

    const handleStopGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setLoading(false);
            setTypingText('');
            setDisplayedTyping('');
        }
    };

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        // Cancel previous request if still loading
        if (loading && abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const userMessage = message.trim();
        setMessage('');

        // Add user message to chat
        const userMsg: Message = {
            id: Date.now().toString(),
            content: userMessage,
            role: 'user',
        };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);

        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session) {
                console.error('Session error:', sessionError);
                return;
            }

            // Create new abort controller for this request
            abortControllerRef.current = new AbortController();

            const response = await fetch(
                'https://emdmuzhgzgapxzfrezzs.supabase.co/functions/v1/openrouter-proxy',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({
                        model: selectedModel,
                        messages: [
                            ...messages.map(msg => ({
                                role: msg.role,
                                content: msg.content,
                            })),
                            {
                                role: 'user',
                                content: userMessage,
                            },
                        ],
                        stream: false,
                    }),
                    signal: abortControllerRef.current.signal,
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error('Failed to get response');
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            const responseContent = data.choices?.[0]?.message?.content || 'No response';
            // Set typing text to start the typing animation
            setTypingText(responseContent);
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Request cancelled by user');
            } else {
                console.error('Error sending message:', error);
                const errorMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    content: 'Sorry, I encountered an error. Please try again.',
                    role: 'assistant',
                };
                setMessages(prev => [...prev, errorMsg]);
            }
        } finally {
            setLoading(false);
            abortControllerRef.current = null;
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.container}>
                {/* Header - Only show for AI Chat */}
                {activeTab === 'AI' && (
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>New Chat</Text>
                        <View style={styles.headerActions}>
                            <TouchableOpacity style={styles.menuButton}>
                                <MaterialCommunityIcons name="menu" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.avatarButton}>
                                {profile.avatar_url ? (
                                    <Image
                                        source={{ uri: profile.avatar_url }}
                                        style={{ width: 36, height: 36, borderRadius: 18 }}
                                    />
                                ) : (
                                    <Text style={styles.avatarText}>
                                        {profile.display_name?.charAt(0).toUpperCase() || 'U'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Chat Content */}
                {activeTab === 'AI' ? (
                    <>
                        {messages.length === 0 ? (
                            <View style={styles.placeholderContent}>
                                <Text style={styles.promptText}>
                                    {displayText}
                                    <Text style={styles.cursor}>|</Text>
                                </Text>
                            </View>
                        ) : (
                            <ScrollView
                                ref={scrollViewRef}
                                style={styles.chatContent}
                                contentContainerStyle={{ paddingBottom: 20 }}
                                scrollEnabled={true}
                                onContentSizeChange={() => {
                                    scrollViewRef.current?.scrollToEnd({ animated: true });
                                }}
                            >
                                {messages.map((msg) => (
                                    <View key={msg.id} style={styles.messageContainer}>
                                        {msg.role === 'user' ? (
                                            <View style={styles.userMessage}>
                                                <Text style={styles.messageText}>{msg.content}</Text>
                                            </View>
                                        ) : (
                                            <View style={styles.assistantMessage}>
                                                <View>{parseMarkdown(msg.content)}</View>
                                            </View>
                                        )}
                                    </View>
                                ))}
                                {loading && (
                                    <View style={styles.messageContainer}>
                                        <View style={styles.thinkingContainer}>
                                            <Animated.View
                                                style={[
                                                    styles.thinkingDot,
                                                    {
                                                        opacity: dotAnimation.interpolate({
                                                            inputRange: [0, 0.33, 0.66, 1],
                                                            outputRange: [0.3, 1, 0.3, 0.3],
                                                        }),
                                                    },
                                                ]}
                                            />
                                            <Animated.View
                                                style={[
                                                    styles.thinkingDot,
                                                    {
                                                        opacity: dotAnimation.interpolate({
                                                            inputRange: [0, 0.33, 0.66, 1],
                                                            outputRange: [0.3, 0.3, 1, 0.3],
                                                        }),
                                                    },
                                                ]}
                                            />
                                            <Animated.View
                                                style={[
                                                    styles.thinkingDot,
                                                    {
                                                        opacity: dotAnimation.interpolate({
                                                            inputRange: [0, 0.33, 0.66, 1],
                                                            outputRange: [0.3, 0.3, 0.3, 1],
                                                        }),
                                                    },
                                                ]}
                                            />
                                            <Text style={styles.thinkingText}>
                                                {availableModels.find(m => m.id === selectedModel)?.name || 'Model'} is thinking...
                                            </Text>
                                        </View>
                                    </View>
                                )}
                                {displayedTyping && (
                                    <View style={styles.messageContainer}>
                                        <View style={styles.assistantMessage}>
                                            <View>{parseMarkdown(displayedTyping)}</View>
                                        </View>
                                    </View>
                                )}
                            </ScrollView>
                        )}

                        {/* Input Area */}
                        <View
                            style={[
                                styles.inputContainer,
                                {
                                    paddingBottom: keyboardHeight > 0
                                        ? keyboardHeight - insets.bottom - 27
                                        : Math.max(insets.bottom, 8)
                                }
                            ]}
                        >
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={[styles.input, message === '' && styles.inputPlaceholder]}
                                    placeholder="Ask anything"
                                    placeholderTextColor="#6B7280"
                                    value={message}
                                    onChangeText={setMessage}
                                    multiline
                                    maxLength={500}
                                />
                                <Animated.View
                                    style={{
                                        flexDirection: 'row',
                                        gap: 8,
                                        marginBottom: 3,
                                        opacity: buttonsOpacity,
                                        transform: [{ scale: buttonsScale }],
                                    }}
                                >
                                    {loading ? (
                                        <TouchableOpacity style={styles.iconButton} onPress={handleStopGeneration}>
                                            <MaterialCommunityIcons name="stop-circle" size={20} color="#EF4444" />
                                        </TouchableOpacity>
                                    ) : message.trim() === '' ? (
                                        <>
                                            <TouchableOpacity style={styles.iconButton}>
                                                <MaterialCommunityIcons name="microphone" size={20} color="#FFFFFF" />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.iconButton}>
                                                <MaterialCommunityIcons name="book-outline" size={20} color="#FFFFFF" />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.iconButton}>
                                                <Feather name="paperclip" size={20} color="#FFFFFF" />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.iconButton} onPress={() => setSettingsModalVisible(true)}>
                                                <MaterialCommunityIcons name="cog" size={20} color="#FFFFFF" />
                                            </TouchableOpacity>
                                        </>
                                    ) : (
                                        <>
                                            <TouchableOpacity style={styles.iconButton}>
                                                <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#FFFFFF" />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.iconButton} onPress={handleSendMessage}>
                                                <MaterialCommunityIcons name="send" size={20} color="#FFFFFF" />
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </Animated.View>
                            </View>
                        </View>
                    </>
                ) : selectedConversation ? (
                    <View style={styles.conversationViewContainer}>
                        {/* Header */}
                        <View style={styles.conversationHeader}>
                            <View style={styles.conversationHeaderLeft}>
                                <TouchableOpacity style={styles.conversationBackButton} onPress={() => setSelectedConversation(null)}>
                                    <MaterialCommunityIcons name="chevron-left" size={24} color="#FFFFFF" />
                                </TouchableOpacity>
                                {selectedConversation.avatarUrl ? (
                                    <Image 
                                        source={{ uri: selectedConversation.avatarUrl }} 
                                        style={[styles.conversationAvatar, { width: 36, height: 36, borderRadius: 18 }]}
                                    />
                                ) : (
                                    <View style={[styles.conversationAvatar, { width: 36, height: 36, borderRadius: 18 }]}>
                                        <Text style={[styles.conversationAvatarText, { fontSize: 16 }]}>{selectedConversation.avatar}</Text>
                                    </View>
                                )}
                                <View style={styles.conversationHeaderInfo}>
                                    <Text style={styles.conversationHeaderName}>{selectedConversation.name}</Text>
                                    <Text style={styles.conversationHeaderUsername}>{selectedConversation.username}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Messages */}
                        <ScrollView
                            ref={conversationScrollViewRef}
                            style={styles.conversationMessagesView}
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={true}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        >
                            {conversationMessagesLoading ? (
                                <MessageSkeletonLoader />
                            ) : conversationMessages.length === 0 ? (
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
                                    <Text style={{ color: '#6B7280', fontSize: 14 }}>No messages yet</Text>
                                </View>
                            ) : (
                                conversationMessages.map((msg) => (
                                    <View
                                        key={msg.id}
                                        style={[
                                            styles.messageRow,
                                            msg.sender === 'user' && styles.userMessageRow,
                                        ]}
                                    >
                                        <View style={[
                                            styles.messageBubble,
                                            msg.sender === 'user' ? styles.userMessageBubble : styles.otherMessageBubble,
                                        ]}>
                                            <Text style={styles.messageBubbleText}>{msg.text}</Text>
                                            <Text style={[styles.messageTime, { marginTop: 4, fontSize: 11, color: msg.sender === 'user' ? '#B8C5D6' : '#6B7280' }]}>{msg.time}</Text>
                                        </View>
                                    </View>
                                ))
                            )}
                        </ScrollView>

                        {/* Input */}
                        <View
                            style={[
                                styles.conversationInputContainer,
                                {
                                    marginBottom: keyboardHeight > 0 ? keyboardHeight - insets.bottom - 40 : 0,
                                }
                            ]}
                        >
                            <View style={styles.conversationInputWrapper}>
                                <Animated.View
                                    style={{
                                        opacity: conversationInputText.trim() === '' ? conversationButtonsOpacity : 0,
                                        transform: [{ scale: conversationInputText.trim() === '' ? conversationButtonsScale : 0.8 }],
                                        display: conversationInputText.trim() === '' ? 'flex' : 'none',
                                    }}
                                >
                                    <TouchableOpacity style={{ marginVertical: 5 }}>
                                        <MaterialCommunityIcons name="emoticon-outline" size={20} color="#A8ADB5" />
                                    </TouchableOpacity>
                                </Animated.View>
                                <TextInput
                                    style={styles.conversationInput}
                                    placeholder="Type a message..."
                                    placeholderTextColor="#6B7280"
                                    value={conversationInputText}
                                    onChangeText={setConversationInputText}
                                    multiline
                                />
                                <Animated.View
                                    style={{
                                        flexDirection: 'row',
                                        gap: 8,
                                        opacity: conversationButtonsOpacity,
                                        transform: [{ scale: conversationButtonsScale }],
                                    }}
                                >
                                    {conversationInputText.trim() === '' ? (
                                        <>
                                            <TouchableOpacity style={{ marginVertical: 5 }}>
                                                <Feather name="paperclip" size={20} color="#A8ADB5" />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={{ marginVertical: 5 }}>
                                                <MaterialCommunityIcons name="microphone" size={20} color="#A8ADB5" />
                                            </TouchableOpacity>
                                        </>
                                    ) : (
                                        <TouchableOpacity style={{ marginVertical: 5 }} onPress={async () => {
                                            const messageText = conversationInputText;
                                            setConversationInputText('');
                                            
                                            // Optimistic update - show message immediately
                                            const optimisticMessage = {
                                                id: `temp-${Date.now()}`,
                                                text: messageText,
                                                sender: 'user',
                                                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                            };
                                            setConversationMessages(prev => [...prev, optimisticMessage]);
                                            
                                            // Save to Supabase
                                            try {
                                                const { data: { user } } = await supabase.auth.getUser();
                                                if (user && selectedConversation) {
                                                    await supabase.from('messages').insert({
                                                        conversation_id: selectedConversation.id,
                                                        sender_id: user.id,
                                                        content: messageText,
                                                        type: 'text',
                                                        created_at: new Date().toISOString(),
                                                    });
                                                    
                                                    // Invalidate conversation list cache to show updated last message
                                                    conversationListCacheRef.current = null;
                                                    // Refetch conversation list
                                                    fetchConversations();
                                                }
                                            } catch (error) {
                                                console.error('Error saving message:', error);
                                                // Remove optimistic message on error
                                                setConversationMessages(prev => 
                                                    prev.filter(msg => msg.id !== optimisticMessage.id)
                                                );
                                            }
                                        }}>
                                            <MaterialCommunityIcons name="send" size={20} color="#1D60E0" />
                                        </TouchableOpacity>
                                    )}
                                </Animated.View>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View style={styles.messagesContainer}>
                        {/* Header */}
                        <View style={styles.messagesHeader}>
                            <Text style={styles.messagesHeaderTitle}>Messages</Text>
                            <TouchableOpacity style={styles.headerButton}>
                                <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>

                        {/* Search */}
                        <View style={styles.searchContainer}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search conversations..."
                                placeholderTextColor="#6B7280"
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                        </View>

                        {/* Conversations List */}
                        <ScrollView style={styles.conversationsList} showsVerticalScrollIndicator={false}>
                            {conversationsLoading ? (
                                <ConversationSkeletonLoader />
                            ) : conversations.length > 0 ? (
                                conversations.map((conv) => (
                                    <TouchableOpacity key={conv.id} style={styles.conversationItem} onPress={() => setSelectedConversation(conv)} activeOpacity={0.7}>
                                        {conv.avatarUrl ? (
                                            <Image 
                                                source={{ uri: conv.avatarUrl }} 
                                                style={styles.conversationAvatar}
                                            />
                                        ) : (
                                            <View style={styles.conversationAvatar}>
                                                <Text style={styles.conversationAvatarText}>{conv.avatar}</Text>
                                            </View>
                                        )}
                                        <View style={styles.conversationContent}>
                                            <View style={styles.conversationHeader}>
                                                <Text style={styles.conversationName} numberOfLines={1}>{conv.name}</Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                    {conv.time && <Text style={styles.conversationTime}>{conv.time}</Text>}
                                                    {unreadCounts[conv.id] > 0 && (
                                                        <View style={[styles.unreadBadge, { backgroundColor: '#1D60E0', width: 'auto', height: 'auto', paddingHorizontal: 6, paddingVertical: 2 }]}>
                                                            <Text style={[styles.unreadBadgeText, { fontSize: 10, color: '#FFFFFF' }]}>{unreadCounts[conv.id]}</Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                            <Text style={styles.conversationMessage} numberOfLines={1}>
                                                {conv.lastMessage}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <View style={{ height: 400, justifyContent: 'center', alignItems: 'center' }}>
                                    <MaterialCommunityIcons name="chat-outline" size={48} color="#6B7280" />
                                    <Text style={{ color: '#9CA3AF', fontSize: 16, marginTop: 16 }}>No conversations yet</Text>
                                </View>
                            )}
                        </ScrollView>

                        {/* New Message Button */}
                        <TouchableOpacity style={styles.newMessageButton}>
                            <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
                            <Text style={styles.newMessageButtonText}>New Message</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Settings Modal */}
                <Modal
                    visible={settingsModalVisible}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setSettingsModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Select Model</Text>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {availableModels.map((model) => (
                                    <TouchableOpacity
                                        key={model.id}
                                        style={[
                                            styles.modelItem,
                                            selectedModel === model.id && styles.modelItemSelected,
                                        ]}
                                        onPress={() => {
                                            setSelectedModel(model.id);
                                            setSettingsModalVisible(false);
                                        }}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.modelItemText}>{model.name}</Text>
                                            <Text style={styles.modelItemSubtext}>{model.provider}</Text>
                                        </View>
                                        {selectedModel === model.id && (
                                            <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* Bottom Navigation */}
                <View style={styles.bottomTabsContainer}>
                    <TouchableOpacity
                        style={[styles.bottomTab, activeTab === 'AI' && styles.bottomTabActive]}
                        onPress={() => setActiveTab('AI')}
                    >
                        <Text style={[styles.bottomTabText, activeTab === 'AI' && styles.bottomTabTextActive]}>AI Chat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.bottomTab, activeTab === 'Messages' && styles.bottomTabActive]}
                        onPress={() => setActiveTab('Messages')}
                    >
                        <Text style={[styles.bottomTabText, activeTab === 'Messages' && styles.bottomTabTextActive]}>Messages</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}