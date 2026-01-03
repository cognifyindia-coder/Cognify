import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import { supabase } from '../supabase/utils/supabase';
import PromptCard from '../components/prompt-card';
import { parsePromptContent, parseFullContent } from '../utils/contentParser';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0E27',
    },
    content: {
        padding: 20,
        paddingHorizontal: 16,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: '#8FA3BE',
    },
    searchBarContainer: {
        marginBottom: 0,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(26, 31, 53, 0.6)',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: 'rgba(100, 100, 180, 0.3)',
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: '#E0E7FF',
    },
    filterRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    filterButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(26, 31, 53, 0.6)',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: 'rgba(100, 100, 180, 0.3)',
    },
    filterText: {
        fontSize: 14,
        color: '#E0E7FF',
        fontWeight: '500',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: 'rgba(26, 31, 53, 0.6)',
        borderWidth: 1,
        borderColor: 'rgba(100, 100, 180, 0.3)',
    },
    buttonText: {
        fontSize: 14,
        color: '#E0E7FF',
        fontWeight: '600',
    },
    tabsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
        paddingHorizontal: 0,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(100, 100, 180, 0.3)',
    },
    tabActive: {
        backgroundColor: '#6366F1',
        borderColor: '#6366F1',
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#8FA3BE',
    },
    tabTextActive: {
        color: '#FFFFFF',
    },
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#8FA3BE',
        marginBottom: 12,
        textAlign: 'center',
    },
    emptyStateText: {
        fontSize: 13,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20,
    },
});

export default function SearchScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState('latest');
    const [filterCategory, setFilterCategory] = useState('All');
    const [sortBy, setSortBy] = useState('Recent Prompts');
    const [prompts, setPrompts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPrompts();
    }, [selectedTab, searchQuery]);

    const fetchPrompts = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('prompts')
                .select('*, profiles:user_id(username, display_name, avatar_url)')
                .eq('is_public', true);

            // Apply search filter
            if (searchQuery.trim()) {
                query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
            }

            // Apply sorting based on tab
            if (selectedTab === 'trending') {
                query = query.order('views', { ascending: false });
            } else if (selectedTab === 'popular') {
                query = query.order('likes', { ascending: false });
            } else {
                query = query.order('created_at', { ascending: false });
            }

            const { data, error } = await query.limit(20);

            if (error) throw error;
            setPrompts(data || []);
        } catch (error) {
            console.error('Error fetching prompts:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Community</Text>
                        <Text style={styles.subtitle}>Explore and share prompts with the community.</Text>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchBarContainer}>
                        <View style={styles.searchBar}>
                            <FontAwesome5 name="search" size={14} color="#6B7280" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search prompts, type, or descriptions."
                                placeholderTextColor="#6B7280"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                    </View>

                    {/* Filters */}
                    <View style={styles.filterRow}>
                        <TouchableOpacity style={styles.filterButton}>
                            <Text style={styles.filterText}>{filterCategory}</Text>
                            <FontAwesome5 name="chevron-down" size={12} color="#8FA3BE" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.filterButton}>
                            <Text style={styles.filterText}>{sortBy}</Text>
                            <FontAwesome5 name="chevron-down" size={12} color="#8FA3BE" />
                        </TouchableOpacity>
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.button}>
                            <Text style={styles.buttonText}>History</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button}>
                            <Text style={styles.buttonText}>Buy Credits</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabsContainer}>
                        <TouchableOpacity 
                            style={[styles.tab, selectedTab === 'trending' && styles.tabActive]}
                            onPress={() => setSelectedTab('trending')}
                        >
                            <FontAwesome5 name="fire" size={12} color={selectedTab === 'trending' ? '#FFFFFF' : '#8FA3BE'} />
                            <Text style={[styles.tabText, selectedTab === 'trending' && styles.tabTextActive]}>
                                Trending
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.tab, selectedTab === 'popular' && styles.tabActive]}
                            onPress={() => setSelectedTab('popular')}
                        >
                            <FontAwesome5 name="heart" size={12} color={selectedTab === 'popular' ? '#FFFFFF' : '#8FA3BE'} />
                            <Text style={[styles.tabText, selectedTab === 'popular' && styles.tabTextActive]}>
                                Popular
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.tab, selectedTab === 'latest' && styles.tabActive]}
                            onPress={() => setSelectedTab('latest')}
                        >
                            <FontAwesome5 name="clock" size={12} color={selectedTab === 'latest' ? '#FFFFFF' : '#8FA3BE'} />
                            <Text style={[styles.tabText, selectedTab === 'latest' && styles.tabTextActive]}>
                                Latest
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Prompts List */}
                    {loading ? (
                        <View style={styles.emptyStateContainer}>
                            <Text style={styles.emptyStateTitle}>Loading prompts...</Text>
                        </View>
                    ) : prompts.length > 0 ? (
                        <View>
                             {prompts.map((prompt) => {
                                 const parsedContent = parseFullContent(prompt.content);
                                 return (
                                     <PromptCard
                                         key={prompt.id}
                                         title={prompt.title}
                                         description={parsedContent.description}
                                         category={prompt.library || 'General'}
                                         tag={parsedContent.library || prompt.library}
                                         likes={prompt.likes || 0}
                                     views={prompt.views || 0}
                                     creatorName={prompt.profiles?.display_name || prompt.profiles?.username || 'Anonymous'}
                                     creatorAvatar={prompt.profiles?.avatar_url}
                                     thumbnailUrl={prompt.thumbnail_url}
                                     onCopyToLibrary={() => {
                                         console.log('Copy to library:', prompt.id);
                                     }}
                                     onSave={() => {
                                         console.log('Save:', prompt.id);
                                     }}
                                     onLike={() => {
                                         console.log('Like:', prompt.id);
                                     }}
                                     onShare={() => {
                                         console.log('Share:', prompt.id);
                                     }}
                                     />
                                 );
                             })}
                         </View>
                    ) : (
                        <View style={styles.emptyStateContainer}>
                            <Text style={styles.emptyStateTitle}>No prompts found</Text>
                            <Text style={styles.emptyStateText}>
                                Try adjusting your search or filters, or create some public prompts to share with the community!
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
