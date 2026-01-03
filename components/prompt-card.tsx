import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: 'rgba(26, 31, 53, 0.5)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(100, 100, 180, 0.3)',
        overflow: 'hidden',
        marginBottom: 16,
    },
    thumbnailContainer: {
        position: 'relative',
        height: 200,
        backgroundColor: 'rgba(10, 14, 39, 0.8)',
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    thumbnail: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.4,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 6,
        marginBottom: 0,
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.3)',
    },
    categoryText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#A0A9FF',
    },
    statsContainer: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'column',
        gap: 8,
    },
    statBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.3)',
    },
    statText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#E0E7FF',
    },
    titleOverlay: {
        position: 'absolute',
        bottom: 12,
        left: 16,
        right: 16,
    },
    titleText: {
        fontSize: 20,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    contentContainer: {
        padding: 16,
    },
    tagContainer: {
        marginBottom: 12,
    },
    tagText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#8FA3BE',
        fontFamily: 'monospace',
    },
    promptTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    promptDescription: {
        fontSize: 13,
        color: '#A0A9FF',
        lineHeight: 20,
        marginBottom: 16,
    },
    creatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    creatorAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(99, 102, 241, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#6366F1',
    },
    creatorInfo: {
        flex: 1,
    },
    creatorName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#E0E7FF',
    },
    creatorRole: {
        fontSize: 11,
        color: '#8FA3BE',
        marginTop: 2,
    },
    actionContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.3)',
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#A0A9FF',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.3)',
    },
});

interface PromptCardProps {
    title: string;
    description: string;
    category: string;
    tag?: string;
    likes: number;
    views: number;
    creatorName: string;
    creatorAvatar?: string;
    thumbnailUrl?: string;
    onCopyToLibrary?: () => void;
    onSave?: () => void;
    onLike?: () => void;
    onShare?: () => void;
}

export default function PromptCard({
    title,
    description,
    category,
    tag,
    likes,
    views,
    creatorName,
    creatorAvatar,
    thumbnailUrl,
    onCopyToLibrary,
    onSave,
    onLike,
    onShare,
}: PromptCardProps) {
    return (
        <View style={styles.cardContainer}>
            {/* Thumbnail Section */}
            <View style={styles.thumbnailContainer}>
                {thumbnailUrl && (
                    <Image
                        source={{ uri: thumbnailUrl }}
                        style={styles.thumbnail}
                    />
                )}

                {/* Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statBadge}>
                        <FontAwesome5 name="heart" size={10} color="#E0E7FF" />
                        <Text style={styles.statText}>{likes} likes</Text>
                    </View>
                    <View style={styles.statBadge}>
                        <FontAwesome5 name="eye" size={10} color="#E0E7FF" />
                        <Text style={styles.statText}>{views} views</Text>
                    </View>
                </View>

                {/* Category Badge */}
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{category}</Text>
                </View>
            </View>

            {/* Content Section */}
            <View style={styles.contentContainer}>
                {/* Tag */}
                {tag && (
                    <View style={styles.tagContainer}>
                        <Text style={styles.tagText}>{tag}</Text>
                    </View>
                )}

                {/* Prompt Title and Description */}
                <Text style={styles.promptTitle}>{title}</Text>
                <Text style={styles.promptDescription} numberOfLines={3}>
                    {description}
                </Text>

                {/* Creator Info */}
                <View style={styles.creatorContainer}>
                    <View style={styles.creatorAvatar}>
                        {creatorAvatar ? (
                            <Image
                                source={{ uri: creatorAvatar }}
                                style={{ width: 32, height: 32, borderRadius: 16 }}
                            />
                        ) : (
                            <Text style={{ fontSize: 14, color: '#6366F1', fontWeight: '700' }}>
                                {creatorName.charAt(0).toUpperCase()}
                            </Text>
                        )}
                    </View>
                    <View style={styles.creatorInfo}>
                        <Text style={styles.creatorName}>{creatorName}</Text>
                        <Text style={styles.creatorRole}>Creator</Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity style={styles.actionButton} onPress={onCopyToLibrary}>
                        <FontAwesome5 name="copy" size={12} color="#A0A9FF" />
                        <Text style={styles.actionButtonText}>Copy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={onSave}>
                        <FontAwesome5 name="bookmark" size={14} color="#A0A9FF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={onLike}>
                        <FontAwesome5 name="heart" size={14} color="#A0A9FF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={onShare}>
                        <FontAwesome5 name="share-alt" size={14} color="#A0A9FF" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
