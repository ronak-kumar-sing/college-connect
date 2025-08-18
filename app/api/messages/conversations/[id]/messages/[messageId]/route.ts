// app/api/messages/conversations/[id]/messages/[messageId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import { withAuth } from '@/lib/middleware/auth';

// Update message (edit or mark as read)
export const PUT = withAuth(async (request: NextRequest, { userId }) => {
  try {
    await connectDB();

    // Extract IDs from the URL path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const conversationId = pathSegments[pathSegments.indexOf('conversations') + 1];
    const messageId = pathSegments[pathSegments.length - 1];

    const body = await request.json();
    const { content, markAsRead } = body;

    // Verify user is participant in the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found or access denied' },
        { status: 404 }
      );
    }

    const message = await Message.findById(messageId);

    if (!message || message.conversation.toString() !== conversationId) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    if (markAsRead) {
      // Mark message as read by current user
      const alreadyRead = message.readBy.some(
        (read: any) => read.user.toString() === userId
      );

      if (!alreadyRead) {
        message.readBy.push({ user: userId, readAt: new Date() });
        await message.save();
      }

      return NextResponse.json({
        message: 'Message marked as read',
        readBy: message.readBy.map((read: any) => ({
          user: read.user.toString(),
          readAt: read.readAt
        }))
      });
    }

    if (content !== undefined) {
      // Edit message - only sender can edit their own messages
      if (message.sender.toString() !== userId) {
        return NextResponse.json(
          { error: 'You can only edit your own messages' },
          { status: 403 }
        );
      }

      if (!content || content.trim() === '') {
        return NextResponse.json(
          { error: 'Message content cannot be empty' },
          { status: 400 }
        );
      }

      message.content = content.trim();
      message.edited = true;
      message.editedAt = new Date();
      await message.save();

      // Populate sender for response
      await message.populate('sender', 'name username');
      await message.populate('replyTo', 'content sender messageType');

      return NextResponse.json({
        message: {
          id: message._id.toString(),
          content: message.content,
          messageType: message.messageType,
          sender: {
            id: message.sender._id.toString(),
            name: message.sender.name,
            username: message.sender.username
          },
          edited: message.edited,
          editedAt: message.editedAt,
          replyTo: message.replyTo ? {
            id: message.replyTo._id.toString(),
            content: message.replyTo.content,
            sender: message.replyTo.sender.toString(),
            messageType: message.replyTo.messageType
          } : null,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt
        }
      });
    }

    return NextResponse.json(
      { error: 'Either content or markAsRead is required' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    );
  }
});

// Delete message
export const DELETE = withAuth(async (request: NextRequest, { userId }) => {
  try {
    await connectDB();

    // Extract IDs from the URL path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const conversationId = pathSegments[pathSegments.indexOf('conversations') + 1];
    const messageId = pathSegments[pathSegments.length - 1];

    // Verify user is participant in the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found or access denied' },
        { status: 404 }
      );
    }

    const message = await Message.findById(messageId);

    if (!message || message.conversation.toString() !== conversationId) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Only sender can delete their own messages
    if (message.sender.toString() !== userId) {
      return NextResponse.json(
        { error: 'You can only delete your own messages' },
        { status: 403 }
      );
    }

    // Soft delete the message
    message.deleted = true;
    message.deletedAt = new Date();
    message.content = 'This message was deleted';
    await message.save();

    return NextResponse.json({
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
});
