import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { ownerAuth } from '@/lib/middleware/ownerAuth';

export async function POST(request: NextRequest) {
  const authResult = await ownerAuth(request);

  if (!authResult.success) {
    return authResult.response!;
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const uploadedFiles: string[] = [];
    const uploadDir = path.join(process.cwd(), 'public/uploads/properties');

    // Ensure upload directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        continue; // Skip non-image files
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        continue; // Skip files that are too large
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substr(2, 9);
      const fileName = `${timestamp}-${randomString}.jpg`;
      const filePath = path.join(uploadDir, fileName);

      // Convert File to Buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Process image with Sharp (resize and optimize)
      const processedBuffer = await sharp(buffer)
        .resize(1200, 800, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: 85,
          progressive: true
        })
        .toBuffer();

      // Save processed image
      await writeFile(filePath, processedBuffer);

      // Store the URL path
      uploadedFiles.push(`/uploads/properties/${fileName}`);
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}
