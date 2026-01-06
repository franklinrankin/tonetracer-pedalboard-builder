#!/usr/bin/env python3
"""
Pedal Image Cropping & Standardization Script

This script processes pedal images to:
1. Auto-trim white/light backgrounds
2. Center the pedal
3. Add white padding to make square
4. Resize to standard dimensions
5. Optimize for web

Usage:
    python scripts/crop-pedal-images.py [--input DIR] [--output DIR] [--size 400] [--preview]

Requirements:
    pip install Pillow numpy
"""

import os
import argparse
from pathlib import Path
from PIL import Image, ImageOps, ImageFilter
import numpy as np

# Configuration
DEFAULT_SIZE = 400  # Output size (square)
BACKGROUND_COLOR = (255, 255, 255)  # White
PADDING_PERCENT = 0.08  # 8% padding around pedal
FUZZ_THRESHOLD = 30  # Tolerance for background detection (0-255)


def detect_content_bounds(img, fuzz=FUZZ_THRESHOLD):
    """
    Detect the bounding box of the actual content (pedal) in the image.
    Works by finding non-background pixels.
    """
    # Convert to RGB if necessary
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    # Convert to numpy array
    data = np.array(img)
    
    # Detect background color (sample corners)
    corners = [
        data[0, 0],
        data[0, -1],
        data[-1, 0],
        data[-1, -1]
    ]
    bg_color = np.median(corners, axis=0)
    
    # Find pixels that differ from background
    diff = np.abs(data.astype(float) - bg_color)
    mask = np.any(diff > fuzz, axis=2)
    
    # Find bounding box of non-background pixels
    rows = np.any(mask, axis=1)
    cols = np.any(mask, axis=0)
    
    if not rows.any() or not cols.any():
        # No content found, return full image
        return 0, 0, img.width, img.height
    
    y_min, y_max = np.where(rows)[0][[0, -1]]
    x_min, x_max = np.where(cols)[0][[0, -1]]
    
    return x_min, y_min, x_max + 1, y_max + 1


def process_image(input_path, output_path, target_size=DEFAULT_SIZE, preview=False):
    """
    Process a single pedal image.
    """
    try:
        # Open image
        img = Image.open(input_path)
        original_size = img.size
        
        # Convert to RGB (handle PNG transparency)
        if img.mode in ('RGBA', 'P'):
            # Create white background
            background = Image.new('RGB', img.size, BACKGROUND_COLOR)
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Detect content bounds
        x1, y1, x2, y2 = detect_content_bounds(img)
        content_width = x2 - x1
        content_height = y2 - y1
        
        # Crop to content
        img = img.crop((x1, y1, x2, y2))
        
        # Calculate padding
        max_dim = max(content_width, content_height)
        padding = int(max_dim * PADDING_PERCENT)
        
        # Create square canvas with padding
        canvas_size = max_dim + (padding * 2)
        canvas = Image.new('RGB', (canvas_size, canvas_size), BACKGROUND_COLOR)
        
        # Center the pedal on canvas
        x_offset = (canvas_size - content_width) // 2
        y_offset = (canvas_size - content_height) // 2
        canvas.paste(img, (x_offset, y_offset))
        
        # Resize to target size
        final = canvas.resize((target_size, target_size), Image.Resampling.LANCZOS)
        
        # Slight sharpening after resize
        final = final.filter(ImageFilter.UnsharpMask(radius=1, percent=50, threshold=3))
        
        if preview:
            # Show before/after comparison
            print(f"  Original: {original_size}")
            print(f"  Content bounds: ({x1}, {y1}) to ({x2}, {y2})")
            print(f"  Content size: {content_width}x{content_height}")
            print(f"  Output: {target_size}x{target_size}")
            return True
        
        # Save with optimization
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        if output_path.suffix.lower() in ('.jpg', '.jpeg'):
            final.save(output_path, 'JPEG', quality=90, optimize=True)
        else:
            final.save(output_path, 'PNG', optimize=True)
        
        return True
        
    except Exception as e:
        print(f"  ERROR: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description='Crop and standardize pedal images')
    parser.add_argument('--input', '-i', default='public/images/pedals',
                        help='Input directory (default: public/images/pedals)')
    parser.add_argument('--output', '-o', default='public/images/pedals-cropped',
                        help='Output directory (default: public/images/pedals-cropped)')
    parser.add_argument('--size', '-s', type=int, default=DEFAULT_SIZE,
                        help=f'Output size in pixels (default: {DEFAULT_SIZE})')
    parser.add_argument('--preview', '-p', action='store_true',
                        help='Preview mode - analyze without saving')
    parser.add_argument('--overwrite', action='store_true',
                        help='Overwrite input files (use with caution!)')
    parser.add_argument('--only', nargs='+',
                        help='Only process specific pedal IDs')
    
    args = parser.parse_args()
    
    input_dir = Path(args.input)
    output_dir = Path(args.output) if not args.overwrite else input_dir
    
    if not input_dir.exists():
        print(f"Error: Input directory '{input_dir}' not found")
        return 1
    
    # Get list of images
    extensions = {'.jpg', '.jpeg', '.png', '.webp'}
    images = [f for f in input_dir.iterdir() 
              if f.suffix.lower() in extensions]
    
    # Filter by --only if specified
    if args.only:
        only_set = set(args.only)
        images = [f for f in images if f.stem in only_set]
    
    print(f"🎸 Pedal Image Processor")
    print(f"   Input:  {input_dir}")
    print(f"   Output: {output_dir}")
    print(f"   Size:   {args.size}x{args.size}")
    print(f"   Images: {len(images)}")
    print()
    
    if args.preview:
        print("📋 PREVIEW MODE - No files will be saved\n")
    
    success = 0
    failed = 0
    
    for i, img_path in enumerate(sorted(images), 1):
        print(f"[{i}/{len(images)}] {img_path.name}")
        
        output_path = output_dir / img_path.name
        
        if process_image(img_path, output_path, args.size, args.preview):
            success += 1
        else:
            failed += 1
    
    print()
    print(f"✅ Processed: {success}")
    if failed:
        print(f"❌ Failed: {failed}")
    
    if not args.preview and success > 0:
        print(f"\n📁 Output saved to: {output_dir}")
        print("\nTo use the cropped images, run:")
        print(f"  mv {output_dir}/* {input_dir}/")
    
    return 0 if failed == 0 else 1


if __name__ == '__main__':
    exit(main())

