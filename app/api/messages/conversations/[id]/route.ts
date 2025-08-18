// app/api/messages/conversations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import { withAuth } from '@/lib/middleware/auth';

// Get conversation details
export const GET = withAuth(async (request: NextRequest, { userId }) => {
  try {
    await connectDB();

    // Extract the ID from the URL path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const conversationId = pathSegments[pathSegments.indexOf('conversations') + 1];

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId // Ensure user is a participant
    }).populate('participants', 'name username')
      .populate('admin', 'name username')
      .populate('lastMessage', 'content messageType sender createdAt');

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Get unread message count for this user
    const unreadCount = await Message.countDocuments({
      conversation: conversationId,
      'readBy.user': { $ne: userId },
      sender: { $ne: userId }
    });

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
          id: conversation.admin._id.toString(),
          name: conversation.admin.name,
          username: conversation.admin.username
        } : null,
        lastMessage: conversation.lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        metadata: conversation.metadata,
        unreadCount,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
});

// Update conversation
export const PUT = withAuth(async (request: NextRequest, { userId }) => {
  try {
    await connectDB();

    // Extract the ID from the URL path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const conversationId = pathSegments[pathSegments.indexOf('conversations') + 1];

    const body = await request.json();
    const { title, description, participants } = body;

    // Find conversation and check if user is admin or participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      $or: [
        { admin: userId },
        { participants: userId }
      ]
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found or insufficient permissions' },
        { status: 404 }
      );
    }

    // Only admin can update group conversations (except for direct conversations)
    if (conversation.type === 'group' && conversation.admin?.toString() !== userId) {
      return NextResponse.json(
        { error: 'Only admin can update group conversations' },
        { status: 403 }
      );
    }

    // Update fields
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (participants && Array.isArray(participants)) {
      updateData.participants = [...new Set(participants)];
    }

    const updatedConversation = await Conversation.findByIdAndUpdate(
      conversationId,
      updateData,
      { new: true }
    ).populate('participants', 'name username')
      .populate('admin', 'name username');

    return NextResponse.json({
      conversation: {
        id: updatedConversation!._id.toString(),
        type: updatedConversation!.type,
        title: updatedConversation!.title,
        description: updatedConversation!.description,
        participants: updatedConversation!.participants.map((participant: any) => ({
          id: participant._id.toString(),
          name: participant.name,
          username: participant.username
        })),
        admin: updatedConversation!.admin ? {
          id: updatedConversation!.admin._id.toString(),
          name: updatedConversation!.admin.name,
          username: updatedConversation!.admin.username
        } : null,
        metadata: updatedConversation!.metadata,
        updatedAt: updatedConversation!.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to update conversation' },
      { status: 500 }
    );
  }
});

// Delete/Leave conversation
export const DELETE = withAuth(async (request: NextRequest, { userId }) => {
  try {
    await connectDB();

    // Extract the ID from the URL path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const conversationId = pathSegments[pathSegments.indexOf('conversations') + 1];

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    if (conversation.type === 'direct') {
      // For direct conversations, just remove the user from participants
      // If this leaves only one participant, delete the conversation
      conversation.participants = conversation.participants.filter(
        (participant: any) => participant.toString() !== userId
      );

      if (conversation.participants.length < 1) {
        await Conversation.findByIdAndDelete(conversationId);
        await Message.deleteMany({ conversation: conversationId });

        return NextResponse.json({
          message: 'Conversation deleted successfully'
        });
      } else {
        await conversation.save();
      }
    } else {
      // For group conversations
      if (conversation.admin?.toString() === userId) {
        // If admin is leaving, transfer admin or delete the conversation
        if (conversation.participants.length > 2) {
          // Transfer admin to next participant
          const newAdmin = conversation.participants.find(
            (participant: any) => participant.toString() !== userId
          );
          conversation.admin = newAdmin;
        } else {
          // Delete the group if only 2 participants left
          await Conversation.findByIdAndDelete(conversationId);
          await Message.deleteMany({ conversation: conversationId });

          return NextResponse.json({
            message: 'Group conversation deleted successfully'
          });
        }
      }

      // Remove user from participants
      conversation.participants = conversation.participants.filter(
        (participant: any) => participant.toString() !== userId
      );

      await conversation.save();
    }

    return NextResponse.json({
      message: 'Left conversation successfully'
    });

  } catch (error) {
    console.error('Error deleting/leaving conversation:', error);
    return NextResponse.json(
      { error: 'Failed to leave conversation' },
      { status: 500 }
    );
  }
});
