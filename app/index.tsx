import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, Animated, Pressable, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState, useRef } from 'react';
import { useFonts } from 'expo-font';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../supabase/utils/supabase';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { createMobileCheckout } from '../supabase/utils/payments';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0F0F',
    },
    header: {
        backgroundColor: '#0F0F0F',
        paddingTop: 50,
        paddingBottom: 30,
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#A0A9FF',
    },
    content: {
        padding: 20,
        paddingHorizontal: 16,
    },
    section: {
        marginBottom: 24,
        backgroundColor: '#1F172A',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#e5e7eb',
        marginBottom: 6,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#94a3b8',
        marginBottom: 14,
    },
    card: {
        backgroundColor: '#1F172A',
        borderRadius: 10,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    cardText: {
        fontSize: 14,
        color: '#e5e7eb',
        lineHeight: 20,
    },
    userCard: {
        backgroundColor: '#1F172A',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    userEmail: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 8,
    },
    logoutBtn: {
        backgroundColor: '#EF4444',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutText: {
        color: '#fff',
        fontWeight: '600',
    },
    selectorContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        paddingTop: 70,
        backgroundColor: '#0F0F0F',
    },
    selectorButton: {
        backgroundColor: '#1F172A',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#1F2937',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectorText: {
        fontSize: 14,
        color: '#e5e7eb',
        fontWeight: '500',
    },
    dropdownOverlay: {
        position: 'absolute',
        top: 70,
        right: 0,
        backgroundColor: '#1F172A',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#1F2937',
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 15,
        minWidth: 180,
        overflow: 'visible',
        paddingTop: 12,
    },
    dropdownArrow: {
        position: 'absolute',
        top: -8,
        right: 12,
        width: 14,
        height: 14,
        backgroundColor: '#1F172A',
        transform: [{ rotate: '45deg' }],
        borderTopWidth: 1.5,
        borderLeftWidth: 1.5,
        borderTopColor: '#1F2937',
        borderLeftColor: '#1F2937',
        zIndex: 1001,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2D3B5C',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dropdownItemText: {
        fontSize: 14,
        color: '#e5e7eb',
        fontWeight: '500',
        flex: 1,
    },
    dropdownItemActive: {
        backgroundColor: '#2D3B5C',
        borderLeftWidth: 3,
        borderLeftColor: '#6366F1',
        paddingHorizontal: 13,
    },
    dashboardHeadingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    dashboardHeading: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
        fontFamily: 'InterBold',
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#1F172A',
        borderWidth: 2,
        borderColor: '#1F2937',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    avatarPlaceholder: {
        fontSize: 24,
        color: '#e5e7eb',
        fontWeight: '700',
    },
    statsContainer: {
        flexDirection: 'column',
        marginBottom: 24,
        backgroundColor: 'rgba(26, 31, 53, 0.5)',
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: '#2D3B5C',
    },
    statCard: {
        backgroundColor: '#1F172A',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#1F2937',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 6,
        overflow: 'hidden',
        borderTopWidth: 3,
    },
    statCardInnerShadowTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    statCardSmallContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 0,
    },
    statCardSmall: {
        flex: 1,
        backgroundColor: '#1F172A',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#1F2937',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 6,
        overflow: 'hidden',
        borderTopWidth: 3,
    },
    statCardTitle: {
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 6,
        letterSpacing: 0.15,
        color: '#e5e7eb',
    },
    statCardStatus: {
        fontSize: 12,
        color: '#FF6B6B',
        fontWeight: '600',
        marginLeft: 'auto',
    },
    statValue: {
        fontSize: 38,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 4,
        marginTop: 0,
        letterSpacing: -0.5,
    },
    statValueSmall: {
        fontSize: 34,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 4,
        marginTop: 0,
        letterSpacing: -0.5,
    },
    statSubtext: {
        fontSize: 12,
        color: '#A0A9FF',
        lineHeight: 18,
        marginBottom: 0,
        fontWeight: '500',
    },
    statSubtextGreen: {
        fontSize: 12,
        color: '#10B981',
        marginBottom: 0,
        fontWeight: '700',
        marginTop: 0,
    },
    statCTA: {
        marginTop: 24,
        fontSize: 15,
        color: '#8FA3BE',
        fontWeight: '500',
    },
    statButton: {
        backgroundColor: '#3B5BDB',
        paddingVertical: 13,
        paddingHorizontal: 24,
        borderRadius: 10,
        marginTop: 20,
        alignItems: 'center',
        borderWidth: 0,
    },
    statButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    statDotIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 0,
    },
    progressBar: {
        height: 4,
        borderRadius: 2,
        width: '100%',
        marginTop: 8,
        marginBottom: 0,
    },
    quickActionsContainer: {
        marginBottom: 24,
        marginTop: 8,
        backgroundColor: '#1F172A',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    quickActionsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    quickActionsSubtitle: {
        fontSize: 13,
        color: '#94a3b8',
        marginBottom: 14,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1F172A',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    actionItemIcon: {
        width: 44,
        height: 44,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    actionItemContent: {
        flex: 1,
    },
    actionItemTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 3,
    },
    actionItemDescription: {
        fontSize: 12,
        color: '#94a3b8',
    },
    promptPulseContainer: {
        marginBottom: 24,
        marginTop: 8,
        backgroundColor: '#1F172A',
        borderRadius: 14,
        padding: 20,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    promptPulseHeader: {
        marginBottom: 20,
    },
    promptPulseTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    promptPulseSubtitle: {
        fontSize: 13,
        color: '#94a3b8',
    },
    promptPulseStats: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    promptPulseStat: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#1F172A',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    promptPulseStatValue: {
        fontSize: 36,
        fontWeight: '900',
        color: '#e5e7eb',
        marginBottom: 8,
    },
    promptPulseStatLabel: {
        fontSize: 13,
        color: '#94a3b8',
        fontWeight: '600',
    },
    promptPulseCenter: {
        alignItems: 'center',
        marginBottom: 20,
    },
    promptPulseIcon: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: '#1F172A',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    promptPulseActionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    promptPulseActionDescription: {
        fontSize: 13,
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 20,
    },
    recentPromptsContainer: {
        marginBottom: 24,
        marginTop: 8,
        backgroundColor: '#1F172A',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    recentPromptsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 14,
    },
    recentPromptsTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    recentPromptsSubtitle: {
        fontSize: 13,
        color: '#94a3b8',
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#1F172A',
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    sortButtonText: {
        fontSize: 13,
        color: '#FFFFFF',
        fontWeight: '600',
        marginRight: 6,
    },
    promptCard: {
        backgroundColor: '#1F172A',
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    promptCardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    promptIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    promptTitleRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    promptTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
        marginRight: 6,
    },
    promptDescription: {
        fontSize: 13,
        color: '#94a3b8',
        marginTop: 4,
        marginLeft: 34,
    },
    promptCategory: {
        backgroundColor: '#1F172A',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    promptCategoryText: {
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: '500',
    },
    promptCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    promptMetadata: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    promptMetadataText: {
        fontSize: 12,
        color: '#94a3b8',
        marginLeft: 6,
        marginRight: 10,
    },
    promptPrivateTag: {
        backgroundColor: '#1F172A',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    promptPrivateTagText: {
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: '500',
    },
    promptParams: {
        fontSize: 12,
        color: '#94a3b8',
    },
    viewAllPrompts: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
    },
    viewAllPromptsText: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '600',
        marginRight: 6,
    },
});

export default function HomePage() {
     const [email, setEmail] = useState<string | null>(null);
     const router = useRouter();
     const [selectedOption, setSelectedOption] = useState('Select Team');
     const [modalVisible, setModalVisible] = useState(false);
     const [userTeams, setUserTeams] = useState<any[]>([]);
     const [userId, setUserId] = useState<string | null>(null);
     const [createdPromptsCount, setCreatedPromptsCount] = useState(0);
     const [sharedPromptsCount, setSharedPromptsCount] = useState(0);
     const [connectedProvider, setConnectedProvider] = useState<any>(null);
     const [modelLibraryCount, setModelLibraryCount] = useState(0);
     const [recentPrompts, setRecentPrompts] = useState<any[]>([]);
     const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
     const [userInitials, setUserInitials] = useState<string>('');
     const [promptViews, setPromptViews] = useState(0);
     const [promptLikes, setPromptLikes] = useState(0);
     const dropdownAnim = useRef(new Animated.Value(0)).current;

     // Dodo Payments: start hosted checkout session via Supabase Edge Function
     const [checkoutLoading, setCheckoutLoading] = useState(false);
     const handleGoPro = async () => {
       try {
         setCheckoutLoading(true);
         const checkoutUrl = await createMobileCheckout({
           type: 'subscription',
           // No trials and product IDs resolved server-side from subscription_plans by plan_key + currency
           quantity: 1,
           metadata: { plan_key: 'pro' },
         });
         await WebBrowser.openBrowserAsync(checkoutUrl);
         // On completion Dodo will deep link back to cognify://payments/complete
         // You can refresh entitlements on focus or in the deep link screen.
       } catch (e) {
         console.error('Checkout error:', e);
       } finally {
         setCheckoutLoading(false);
       }
     };

     const [fontsLoaded] = useFonts({
        'InterBold': require('../assets/fonts/Inter-Bold.otf'),
    });

    const options = userTeams.map(team => team.name);

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return '1 day ago';
        if (diffInDays < 7) return `${diffInDays} days ago`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
        if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
        return `${Math.floor(diffInDays / 365)} years ago`;
    };

    useEffect(() => {
        checkSession();
    }, []);

    useFocusEffect(() => {
        // Refresh data when screen comes into focus
        checkSession();
    });

    const fetchStatsData = async (userId: string) => {
        try {
            // Fetch all user prompts
            const { data: allPrompts } = await supabase
                .from('prompts')
                .select('id, is_public, views, likes')
                .eq('user_id', userId);

            if (allPrompts) {
                // Count all created prompts
                setCreatedPromptsCount(allPrompts.length);

                // Count shared (public) prompts
                const sharedCount = allPrompts.filter(p => p.is_public).length;
                setSharedPromptsCount(sharedCount);

                // Sum total views from all prompts
                const totalViews = allPrompts.reduce((sum, p) => sum + (p.views || 0), 0);
                setPromptViews(totalViews);

                // Sum total likes from all prompts
                const totalLikes = allPrompts.reduce((sum, p) => sum + (p.likes || 0), 0);
                setPromptLikes(totalLikes);
            }

            // Fetch connected providers
            const { data: providers } = await supabase
                .from('providers')
                .select('*')
                .limit(1)
                .single();
            setConnectedProvider(providers);

            // Fetch model library count
            const { data: models } = await supabase
                .from('models')
                .select('id', { count: 'exact' })
                .eq('user_id', userId);
            setModelLibraryCount(models?.length || 0);

            // Fetch recent prompts
            const { data: recentPromptsData } = await supabase
                .from('prompts')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(5);
            setRecentPrompts(recentPromptsData || []);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
            setUserId(session.user.id);

            // Check if user has completed onboarding
            const { data: profile } = await supabase
                .from('profiles')
                .select('has_onboarded')
                .eq('id', session.user.id)
                .single();

            if (!profile?.has_onboarded) {
                router.replace('/onboarding');
                return;
            }

            setEmail(session.user.email);

            // Fetch user profile data
            const { data: profileData } = await supabase
                .from('profiles')
                .select('display_name, username, avatar_url')
                .eq('id', session.user.id)
                .single();

            if (profileData) {
                // Set user initials
                const name = profileData.display_name || profileData.username || session.user.email;
                const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
                setUserInitials(initials);

                // Set avatar
                if (profileData.avatar_url) {
                    setAvatarUrl(profileData.avatar_url);
                }
            }

            // Fetch user's teams
            const { data: teams } = await supabase
                .from('teams')
                .select('*')
                .eq('owner_id', session.user.id);

            if (teams) {
                setUserTeams(teams);
            }

            // Fetch stats data
            fetchStatsData(session.user.id);
        } else {
            router.replace('/login');
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setEmail(null);
        router.replace('/login');
    };

    if (!fontsLoaded) {
        return null;
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.content, { paddingBottom: 100, paddingTop: 20 }]}>
                    <View style={styles.dashboardHeadingContainer}>
                        <Text style={styles.dashboardHeading}>Dashboard</Text>
                        <TouchableOpacity 
                            style={styles.avatarContainer} 
                            onPress={() => {
                                const newModalVisibility = !modalVisible;
                                setModalVisible(newModalVisibility);
                                Animated.timing(dropdownAnim, {
                                    toValue: newModalVisibility ? 1 : 0,
                                    duration: 250,
                                    useNativeDriver: true,
                                }).start();
                            }}
                        >
                            <Text style={styles.avatarPlaceholder}>{userInitials || '?'}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Team Selector Dropdown */}
                    {modalVisible && (
                        <Animated.View style={[
                            styles.dropdownOverlay,
                            {
                                opacity: dropdownAnim,
                                transform: [
                                    {
                                        translateY: dropdownAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [-5, 0],
                                        })
                                    }
                                ]
                            }
                        ]}>
                            <View style={styles.dropdownArrow} />
                            {userTeams.map((team, index) => (
                                <Pressable
                                    key={team.id}
                                    style={[
                                        styles.dropdownItem,
                                        selectedOption === team.name && styles.dropdownItemActive,
                                        index === userTeams.length - 1 && { borderBottomWidth: 0 }
                                    ]}
                                    onPress={() => {
                                        setSelectedOption(team.name);
                                        setModalVisible(false);
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                        <FontAwesome5 name="users" size={14} color="#A0A9FF" style={{ marginRight: 10 }} />
                                        <Text style={styles.dropdownItemText}>{team.name}</Text>
                                    </View>
                                    {selectedOption === team.name && (
                                        <FontAwesome5 name="check" size={14} color="#6366F1" />
                                    )}
                                </Pressable>
                            ))}
                        </Animated.View>
                    )}

                    {/* Stats Cards */}
                    <View style={styles.statsContainer}>
                        {/* Created Prompts */}
                        <View style={[styles.statCard, { borderTopColor: '#A855F7' }]}>
                            <View style={styles.statCardInnerShadowTop} />
                            <Text style={[styles.statCardTitle, { color: '#A855F7' }]}>Created Prompts</Text>
                            <Text style={styles.statValue}>{createdPromptsCount}</Text>
                            <Text style={styles.statSubtextGreen}>↑ +12% from last month</Text>
                            <View style={[styles.progressBar, { backgroundColor: '#A855F7' }]} />
                        </View>

                        {/* Shared Prompts */}
                        <View style={[styles.statCard, { borderTopColor: '#3B82F6' }]}>
                            <View style={styles.statCardInnerShadowTop} />
                            <Text style={[styles.statCardTitle, { color: '#3B82F6' }]}>Shared Prompts</Text>
                            <Text style={styles.statValue}>{sharedPromptsCount}</Text>
                            <View style={[styles.progressBar, { backgroundColor: '#3B82F6' }]} />
                        </View>

                        {/* Connected Provider & Model Library Row */}
                        <View style={styles.statCardSmallContainer}>
                            {/* Connected Provider */}
                            <View style={[styles.statCardSmall, { borderTopColor: '#10B981' }]}>
                                <View style={styles.statCardInnerShadowTop} />
                                <Text style={[styles.statCardTitle, { color: '#10B981' }]}>Connected Provider</Text>
                                <Text style={styles.statValueSmall}>{connectedProvider?.connected_provider || 'None'}</Text>
                                <Text style={styles.statSubtext}>
                                    {connectedProvider ? 'Connected' : 'No providers connected'}
                                </Text>
                                <View style={[styles.progressBar, { backgroundColor: connectedProvider ? '#10B981' : '#6B7280' }]} />
                            </View>

                            {/* Model Library */}
                            <View style={[styles.statCardSmall, { borderTopColor: '#F97316' }]}>
                                <View style={styles.statCardInnerShadowTop} />
                                <Text style={[styles.statCardTitle, { color: '#F97316' }]}>Model Library</Text>
                                <Text style={styles.statValueSmall}>{modelLibraryCount}</Text>
                                <Text style={styles.statSubtext}>Across 2 providers</Text>
                                <View style={[styles.progressBar, { backgroundColor: '#F97316' }]} />
                            </View>
                        </View>
                    </View>

                    {/* Quick Actions Section */}
                    <View style={styles.quickActionsContainer}>
                        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
                        <Text style={styles.quickActionsSubtitle}>Get started with common tasks</Text>

                        {/* New Chat */}
                        <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/chat')}>
                            <View style={[styles.actionItemIcon, { backgroundColor: 'rgba(99, 102, 241, 0.2)' }]}>
                                <FontAwesome5 name="comments" size={18} color="#6366F1" />
                            </View>
                            <View style={styles.actionItemContent}>
                                <Text style={styles.actionItemTitle}>New Chat</Text>
                                <Text style={styles.actionItemDescription}>Start a conversation with AI</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Create New Prompt */}
                        <TouchableOpacity style={styles.actionItem}>
                            <View style={[styles.actionItemIcon, { backgroundColor: 'rgba(168, 85, 247, 0.2)' }]}>
                                <FontAwesome5 name="plus" size={18} color="#A855F7" />
                            </View>
                            <View style={styles.actionItemContent}>
                                <Text style={styles.actionItemTitle}>Create New Prompt</Text>
                                <Text style={styles.actionItemDescription}>Start building a new AI prompt</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Browse Community */}
                        <TouchableOpacity style={styles.actionItem}>
                            <View style={[styles.actionItemIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                                <FontAwesome5 name="users" size={18} color="#3B82F6" />
                            </View>
                            <View style={styles.actionItemContent}>
                                <Text style={styles.actionItemTitle}>Browse Community</Text>
                                <Text style={styles.actionItemDescription}>Explore community prompts</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Test & Optimize */}
                        <TouchableOpacity style={styles.actionItem}>
                            <View style={[styles.actionItemIcon, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                                <FontAwesome5 name="chart-line" size={18} color="#10B981" />
                            </View>
                            <View style={styles.actionItemContent}>
                                <Text style={styles.actionItemTitle}>Test & Optimize</Text>
                                <Text style={styles.actionItemDescription}>Run A/B tests on prompts</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Manage Libraries */}
                        <TouchableOpacity style={styles.actionItem}>
                            <View style={[styles.actionItemIcon, { backgroundColor: 'rgba(249, 115, 22, 0.2)' }]}>
                                <FontAwesome5 name="folder" size={18} color="#F97316" />
                            </View>
                            <View style={styles.actionItemContent}>
                                <Text style={styles.actionItemTitle}>Manage Libraries</Text>
                                <Text style={styles.actionItemDescription}>Organize prompt libraries</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Go Pro / Subscribe (Dodo Payments) */}
                        <TouchableOpacity style={styles.actionItem} onPress={handleGoPro} disabled={checkoutLoading}>
                            <View style={[styles.actionItemIcon, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                                <FontAwesome5 name="credit-card" size={18} color="#10B981" />
                            </View>
                            <View style={styles.actionItemContent}>
                                <Text style={styles.actionItemTitle}>
                                    {checkoutLoading ? 'Starting Checkout…' : 'Go Pro (Subscribe)'}
                                </Text>
                                <Text style={styles.actionItemDescription}>Unlock premium features</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Prompt Pulse Section */}
                    <View style={styles.promptPulseContainer}>
                        <View style={styles.promptPulseHeader}>
                            <Text style={styles.promptPulseTitle}>Prompt Pulse</Text>
                            <Text style={styles.promptPulseSubtitle}>Track prompt usage and likes over time</Text>
                        </View>

                        <View style={styles.promptPulseStats}>
                            <View style={styles.promptPulseStat}>
                                <Text style={styles.promptPulseStatValue}>{promptViews}</Text>
                                <Text style={styles.promptPulseStatLabel}>Prompt Views</Text>
                            </View>
                            <View style={styles.promptPulseStat}>
                                <Text style={styles.promptPulseStatValue}>{promptLikes}</Text>
                                <Text style={styles.promptPulseStatLabel}>Prompt Likes</Text>
                            </View>
                        </View>

                        <View style={styles.promptPulseCenter}>
                            <View style={styles.promptPulseIcon}>
                                <FontAwesome5 name="rocket" size={32} color="#6366F1" />
                            </View>
                            <Text style={styles.promptPulseActionTitle}>Ready for Action!</Text>
                            <Text style={styles.promptPulseActionDescription}>
                                Your prompts are set up. Share them with the community to start seeing engagement
                            </Text>
                        </View>
                    </View>

                    {/* Recent Prompts Section */}
                    <View style={styles.recentPromptsContainer}>
                        <View style={styles.recentPromptsHeader}>
                            <View>
                                <Text style={styles.recentPromptsTitle}>Recent Prompts</Text>
                                <Text style={styles.recentPromptsSubtitle}>
                                    {recentPrompts.length} {recentPrompts.length === 1 ? 'prompt' : 'prompts'} created recently
                                </Text>
                            </View>
                            <TouchableOpacity style={styles.sortButton}>
                                <Text style={styles.sortButtonText}>Sort</Text>
                                <FontAwesome5 name="sort" size={12} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>

                        {recentPrompts.length > 0 ? (
                            <>
                                {recentPrompts.map((prompt) => (
                                    <View key={prompt.id} style={styles.promptCard}>
                                        <View style={styles.promptCardHeader}>
                                            <View style={styles.promptIcon}>
                                                <FontAwesome5 name="file-alt" size={10} color="#FFFFFF" />
                                            </View>
                                            <View style={styles.promptTitleRow}>
                                                <Text style={styles.promptTitle}>{prompt.title || 'Untitled'}</Text>
                                                {!prompt.is_shared && (
                                                    <FontAwesome5 name="lock" size={10} color="#8FA3BE" />
                                                )}
                                            </View>
                                            <View style={styles.promptCategory}>
                                                <Text style={styles.promptCategoryText}>
                                                    {prompt.category || 'Uncategorized'}
                                                </Text>
                                            </View>
                                        </View>
                                        {prompt.description && (
                                            <Text style={styles.promptDescription}>{prompt.description}</Text>
                                        )}
                                        <View style={styles.promptCardFooter}>
                                            <View style={styles.promptMetadata}>
                                                <FontAwesome5 name="clock" size={10} color="#8FA3BE" />
                                                <Text style={styles.promptMetadataText}>
                                                    {formatTimeAgo(prompt.created_at)}
                                                </Text>
                                                {!prompt.is_shared && (
                                                    <View style={styles.promptPrivateTag}>
                                                        <Text style={styles.promptPrivateTagText}>Private</Text>
                                                    </View>
                                                )}
                                            </View>
                                            {(prompt.temperature || prompt.top_p) && (
                                                <Text style={styles.promptParams}>
                                                    {prompt.temperature && `T:${prompt.temperature}`}
                                                    {prompt.temperature && prompt.top_p && ' '}
                                                    {prompt.top_p && `P:${prompt.top_p}`}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                ))}
                                <TouchableOpacity style={styles.viewAllPrompts}>
                                    <Text style={styles.viewAllPromptsText}>View all prompts</Text>
                                    <FontAwesome5 name="external-link-alt" size={12} color="#3B82F6" />
                                </TouchableOpacity>
                            </>
                        ) : (
                            <View style={styles.promptCard}>
                                <Text style={[styles.promptDescription, { textAlign: 'center', marginLeft: 0 }]}>
                                    No prompts yet. Create your first prompt to get started!
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
