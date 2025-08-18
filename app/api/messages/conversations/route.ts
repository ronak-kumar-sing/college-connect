// app/api/messages/conversations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import { withAuth } from '@/lib/middleware/auth';

// Get all conversations for the authenticated user
export const GET = withAuth(async (request: NextRequest, { userId }) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build query - user must be a participant
    let query: any = { participants: userId };

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get conversations
    const conversations = await Conversation.find(query)
      .populate('participants', 'name username')
      .populate('lastMessage', 'content messageType sender createdAt')
      .populate('admin', 'name username')
      .sort({ lastMessageAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    // Get total count for pagination
    const total = await Conversation.countDocuments(query);

    // Format conversations
    const formattedConversations = await Promise.all(
      conversations.map(async (conv: any) => {
        // Get unread message count for this user
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          'readBy.user': { $ne: userId },
          sender: { $ne: userId }
        });

        // Check if archived by current user
        const isArchived = conv.archived.some((archive: any) =>
          archive.user.toString() === userId
        );

        // Check if blocked
        const isBlocked = conv.blocked.some((block: any) =>
          block.blocker.toString() === userId || block.blocked.toString() === userId
        );

        return {
          id: conv._id.toString(),
          type: conv.type,
          title: conv.title,
          description: conv.description,
          participants: conv.participants.map((participant: any) => ({
            id: participant._id.toString(),
            name: participant.name,
            username: participant.username
          })),
          admin: conv.admin ? {
            id: conv.admin._id.toString(),
            name: conv.admin.name,
            username: conv.admin.username
          } : null,
          lastMessage: conv.lastMessage ? {
            id: conv.lastMessage._id.toString(),
            content: conv.lastMessage.content,
            messageType: conv.lastMessage.messageType,
            sender: conv.lastMessage.sender.toString(),
            createdAt: conv.lastMessage.createdAt
          } : null,
          lastMessageAt: conv.lastMessageAt,
          metadata: conv.metadata,
          unreadCount,
          isArchived,
          isBlocked,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt
        };
      })
    );

    return NextResponse.json({
      conversations: formattedConversations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
});

// Create a new conversation
export const POST = withAuth(async (request: NextRequest, { userId }) => {
  try {
    await connectDB();

    const body = await request.json();
    const {
      participants,
      type = 'direct',
      title,
      description,
      metadata
    } = body;

    // Validate participants
    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return NextResponse.json(
        { error: 'Participants array is required' },
        { status: 400 }
      );
    }

    // Add current user to participants if not already included
    const allParticipants = [...new Set([userId, ...participants])];

    // For direct conversations, check if one already exists
    if (type === 'direct' && allParticipants.length === 2) {
      const existingConversation = await Conversation.findOne({
        type: 'direct',
        participants: { $all: allParticipants, $size: 2 }
      }).populate('participants', 'name username')
        .populate('lastMessage', 'content messageType sender createdAt');

      if (existingConversation) {
        return NextResponse.json({
          conversation: {
            id: existingConversation._id.toString(),
            type: existingConversation.type,
            title: existingConversation.title,
            participants: existingConversation.participants.map((participant: any) => ({
              id: participant._id.toString(),
              name: participant.name,
              username: participant.username
            })),
            lastMessage: existingConversation.lastMessage,
            lastMessageAt: existingConversation.lastMessageAt,
            metadata: existingConversation.metadata,
            createdAt: existingConversation.createdAt
          }
        });
      }
    }

    // Create new conversation
    const conversation = new Conversation({
      participants: allParticipants,
      type,
      title,
      description,
      admin: type === 'group' ? userId : undefined,
      metadata
    });

    await conversation.save();

    // Populate for response
    await conversation.populate('participants', 'name username');

    return NextResponse.json({
      conversation: {
        id: conversation._id.toString(),
        type: conversation.type,
        title: conversation.title,
        description: conversation.description,
        participants: conversation.participants.map((participant: any) => ({
          id: participant._id.toString(),
          name: participant.name,
          username: participant.username
        })),
        admin: conversation.admin ? {
          id: conversation.admin.toString(),
          name: 'Admin' // Will be populated in real usage
        } : null,
        lastMessage: null,
        lastMessageAt: conversation.lastMessageAt,
        metadata: conversation.metadata,
        createdAt: conversation.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
});
