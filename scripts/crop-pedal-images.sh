#!/bin/bash
# Pedal Image Cropping Script (ImageMagick version)
#
# Requirements: brew install imagemagick
#
# Usage:
#   ./scripts/crop-pedal-images.sh                    # Process all images
#   ./scripts/crop-pedal-images.sh boss-ds1 boss-bd2  # Process specific pedals

INPUT_DIR="public/images/pedals"
OUTPUT_DIR="public/images/pedals-cropped"
SIZE=400

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Get list of files to process
if [ $# -gt 0 ]; then
    # Specific files provided
    FILES=()
    for id in "$@"; do
        for ext in jpg jpeg png webp; do
            if [ -f "$INPUT_DIR/$id.$ext" ]; then
                FILES+=("$INPUT_DIR/$id.$ext")
                break
            fi
        done
    done
else
    # All files
    FILES=("$INPUT_DIR"/*.{jpg,jpeg,png,webp} 2>/dev/null)
fi

TOTAL=${#FILES[@]}
COUNT=0
SUCCESS=0

echo "🎸 Pedal Image Cropper (ImageMagick)"
echo "   Input:  $INPUT_DIR"
echo "   Output: $OUTPUT_DIR"
echo "   Size:   ${SIZE}x${SIZE}"
echo "   Images: $TOTAL"
echo ""

for file in "${FILES[@]}"; do
    if [ ! -f "$file" ]; then
        continue
    fi
    
    COUNT=$((COUNT + 1))
    filename=$(basename "$file")
    name="${filename%.*}"
    ext="${filename##*.}"
    
    echo "[$COUNT/$TOTAL] $filename"
    
    output="$OUTPUT_DIR/$name.jpg"
    
    # Process:
    # 1. Trim whitespace (with 10% fuzz for off-white)
    # 2. Add 8% border padding
    # 3. Make square by extending canvas
    # 4. Resize to target size
    # 5. Flatten any transparency to white
    # 6. Sharpen slightly
    convert "$file" \
        -fuzz 10% -trim +repage \
        -bordercolor white -border 8% \
        -gravity center -background white -extent "%[fx:max(w,h)]x%[fx:max(w,h)]" \
        -resize "${SIZE}x${SIZE}" \
        -flatten \
        -unsharp 0x1+0.5+0.03 \
        -quality 90 \
        "$output" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        SUCCESS=$((SUCCESS + 1))
    else
        echo "  ❌ Failed"
    fi
done

echo ""
echo "✅ Processed: $SUCCESS / $TOTAL"
echo ""
echo "📁 Output saved to: $OUTPUT_DIR"
echo ""
echo "To use the cropped images:"
echo "  cp $OUTPUT_DIR/* $INPUT_DIR/"

