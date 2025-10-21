#!/usr/bin/env python3
"""
GitHub Social Card Generator for PixelProdigy
Creates 1280x640px PNG with 40pt safe zone border
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import sys

# Card dimensions
WIDTH = 1280
HEIGHT = 640
SAFE_MARGIN = 53  # 40pt = ~53px at 1x

# Colors
COLOR_BG = '#000000'
COLOR_GOLD = '#FFD700'
COLOR_ORANGE = '#FFA500'
COLOR_PINK = '#FF69B4'
COLOR_WHITE = '#FFFFFF'
COLOR_GRAY = '#CCCCCC'
COLOR_DARK_GRAY = '#666666'

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def create_gradient_background(width, height):
    """Create a dark gradient background"""
    img = Image.new('RGB', (width, height), (0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Create vertical gradient
    for y in range(height):
        ratio = y / height
        # Interpolate from black to dark purple
        r = int(0 + (26 * ratio))
        g = int(0 + (10 * ratio))
        b = int(0 + (26 * ratio))
        color = (r, g, b)
        draw.line([(0, y), (width, y)], fill=color)
    
    return img

def add_glow_border(img, border_width=3):
    """Add glowing golden border"""
    draw = ImageDraw.Draw(img)
    gold_rgb = hex_to_rgb(COLOR_GOLD)
    
    # Draw multiple borders for glow effect (PIL doesn't support alpha in outline)
    for i in range(5):
        width_val = border_width + (i * 2)
        draw.rectangle(
            [i, i, WIDTH - i - 1, HEIGHT - i - 1],
            outline=gold_rgb,
            width=width_val
        )
    
    return img

def add_particles(img, count=30):
    """Add floating particle dots"""
    draw = ImageDraw.Draw(img)
    import random
    gold_rgb = hex_to_rgb(COLOR_GOLD)
    
    for _ in range(count):
        x = random.randint(0, WIDTH)
        y = random.randint(0, HEIGHT)
        size = random.randint(1, 3)
        # PIL doesn't support alpha in fill for JPEG mode, use solid color
        draw.ellipse(
            [x, y, x + size, y + size],
            fill=gold_rgb
        )
    
    return img

def create_social_card(
    title="PixelProdigyAI",
    tagline="3D Sculpting in Your Browser",
    description="Zero downloads • Mobile ready • 10-layer security • WebGL powered",
    features=["🔗 Binding", "💥 Fragmentation", "✨ Particles", "📱 Touch"],
    tech_stack=["Three.js", "WebGL", "10-Layer Security", "eugeneous.dev"],
    show_safe_zone=False
):
    """Generate the social card"""
    
    # Create base image with gradient
    img = create_gradient_background(WIDTH, HEIGHT)
    
    # Add particles
    img = add_particles(img)
    
    # Add border glow
    img = add_glow_border(img)
    
    draw = ImageDraw.Draw(img)
    
    # Try to load fonts (fallback to default if not available)
    try:
        font_title = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 72)
        font_tagline = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 32)
        font_description = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 22)
        font_features = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
        font_tech = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 16)
    except:
        print("⚠️  Using default fonts (install DejaVu fonts for better quality)")
        font_title = ImageFont.load_default()
        font_tagline = ImageFont.load_default()
        font_description = ImageFont.load_default()
        font_features = ImageFont.load_default()
        font_tech = ImageFont.load_default()
    
    # Calculate positions (centered, within safe zone)
    center_x = WIDTH // 2
    current_y = SAFE_MARGIN + 100
    
    # Draw title
    title_bbox = draw.textbbox((0, 0), title, font=font_title)
    title_width = title_bbox[2] - title_bbox[0]
    draw.text(
        (center_x - title_width // 2, current_y),
        title,
        fill=COLOR_GOLD,
        font=font_title
    )
    current_y += 100
    
    # Draw tagline
    tagline_bbox = draw.textbbox((0, 0), tagline, font=font_tagline)
    tagline_width = tagline_bbox[2] - tagline_bbox[0]
    draw.text(
        (center_x - tagline_width // 2, current_y),
        tagline,
        fill=COLOR_GOLD,
        font=font_tagline
    )
    current_y += 60
    
    # Draw description
    desc_bbox = draw.textbbox((0, 0), description, font=font_description)
    desc_width = desc_bbox[2] - desc_bbox[0]
    draw.text(
        (center_x - desc_width // 2, current_y),
        description,
        fill=COLOR_GRAY,
        font=font_description
    )
    current_y += 70
    
    # Draw features (horizontal badges)
    total_feature_width = sum([
        draw.textbbox((0, 0), f, font=font_features)[2] 
        for f in features
    ]) + (len(features) - 1) * 40
    
    feature_x = center_x - total_feature_width // 2
    for feature in features:
        # Draw badge background
        bbox = draw.textbbox((0, 0), feature, font=font_features)
        badge_width = bbox[2] - bbox[0] + 40
        badge_height = 40
        
        # Badge border
        draw.rectangle(
            [feature_x, current_y, feature_x + badge_width, current_y + badge_height],
            outline=COLOR_GOLD,
            width=2
        )
        
        # Badge text
        draw.text(
            (feature_x + 20, current_y + 10),
            feature,
            fill=COLOR_GOLD,
            font=font_features
        )
        
        feature_x += badge_width + 40
    
    current_y += 80
    
    # Draw tech stack
    tech_text = " • ".join(tech_stack)
    tech_bbox = draw.textbbox((0, 0), tech_text, font=font_tech)
    tech_width = tech_bbox[2] - tech_bbox[0]
    draw.text(
        (center_x - tech_width // 2, current_y),
        tech_text,
        fill=COLOR_DARK_GRAY,
        font=font_tech
    )
    
    # Draw safe zone guide (optional)
    if show_safe_zone:
        for i in range(0, WIDTH, 20):
            draw.line(
                [(SAFE_MARGIN, i), (SAFE_MARGIN, i + 10)],
                fill=COLOR_GOLD,
                width=1
            )
            draw.line(
                [(WIDTH - SAFE_MARGIN, i), (WIDTH - SAFE_MARGIN, i + 10)],
                fill=COLOR_GOLD,
                width=1
            )
        
        for i in range(0, HEIGHT, 20):
            draw.line(
                [(i, SAFE_MARGIN), (i + 10, SAFE_MARGIN)],
                fill=COLOR_GOLD,
                width=1
            )
            draw.line(
                [(i, HEIGHT - SAFE_MARGIN), (i + 10, HEIGHT - SAFE_MARGIN)],
                fill=COLOR_GOLD,
                width=1
            )
    
    return img

def main():
    """Main function"""
    print("🎨 GitHub Social Card Generator")
    print("=" * 50)
    print(f"📐 Dimensions: {WIDTH}x{HEIGHT}px")
    print(f"🛡️ Safe Zone: {SAFE_MARGIN}px border ({40}pt)")
    print()
    
    # Generate card
    print("🖼️  Generating card...")
    img = create_social_card(
        title="PixelProdigyAI",
        tagline="3D Sculpting in Your Browser",
        description="Zero downloads • Mobile touch controls • 10-layer security",
        features=["🔗 Binding", "💥 Fragmentation", "✨ Particles", "📱 Touch"],
        tech_stack=["Three.js", "WebGL", "Security", "eugeneous.dev"],
        show_safe_zone=False
    )
    
    # Save image
    output_file = "github_social_card.png"
    img.save(output_file, "PNG", optimize=True)
    
    print(f"✅ Card saved to: {output_file}")
    print(f"📊 File size: {img.size[0]}x{img.size[1]}px")
    print()
    print("📤 Next steps:")
    print("1. Go to GitHub → Settings → Social preview")
    print("2. Upload github_social_card.png")
    print("3. Save and test by sharing your repo link")
    print()
    print("🎉 Done!")

if __name__ == "__main__":
    main()
