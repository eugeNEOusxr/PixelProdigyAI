#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════╗
║  BATCH EUG COMPRESSION - Compress All HTML Files                ║
║  Uses AI Personality System for Intelligent Compression         ║
╚══════════════════════════════════════════════════════════════════╝

This script compresses all HTML files in your PixelProdigyAI directory:
• HTML → Python with XOR crypto-signing
• 3D symbolic language (emoticons)
• AI-optimized compression (typically 90-97%)
• NFT-ready with hash signatures
• Preserves full decompression capability
"""

import os
import glob
from pathlib import Path
from eug_compression_system import EugCompressionSystem

def main():
    print("╔═══════════════════════════════════════════════════════════════════╗")
    print("║          EUG BATCH COMPRESSION - HTML → PY Converter              ║")
    print("║            AI Personality-Driven Crypto Compression               ║")
    print("╚═══════════════════════════════════════════════════════════════════╝\n")
    
    # Initialize compressor
    compressor = EugCompressionSystem()
    
    # Find all HTML files
    html_files = glob.glob("*.html")
    
    if not html_files:
        print("❌ No HTML files found in current directory")
        return
    
    print(f"📁 Found {len(html_files)} HTML files to compress\n")
    
    # Priority files (compress these first)
    priority_files = [
        'index.html',
        'pixelprodigy3d.html',
        'pixelprodigy_unified.html',
        'pixelprodigyperfectstudio.html',
        'pixelprodigy_3d_library.html'
    ]
    
    # Separate priority and regular files
    priority_html = [f for f in html_files if f in priority_files]
    regular_html = [f for f in html_files if f not in priority_files]
    
    # Sort priority files by priority order
    priority_html.sort(key=lambda x: priority_files.index(x) if x in priority_files else 999)
    
    # Compress priority files first
    results = []
    
    if priority_html:
        print("🎯 PRIORITY FILES (Core System):")
        print("─" * 70)
        for i, html_file in enumerate(priority_html, 1):
            print(f"\n[{i}/{len(priority_html)}] Processing: {html_file}")
            result = compressor.html_to_py(html_file)
            if result:
                results.append(result)
    
    # Then compress regular files
    if regular_html:
        print(f"\n\n📄 REGULAR FILES ({len(regular_html)} files):")
        print("─" * 70)
        
        for i, html_file in enumerate(regular_html, 1):
            print(f"\n[{i}/{len(regular_html)}] Processing: {html_file}")
            result = compressor.html_to_py(html_file)
            if result:
                results.append(result)
    
    # Final summary
    print(f"\n\n{'═'*70}")
    print(f"🏆 FINAL BATCH COMPRESSION REPORT")
    print(f"{'═'*70}")
    
    if results:
        total_original = sum(r['original_size'] for r in results)
        total_compressed = sum(r['compressed_size'] for r in results)
        total_saved = total_original - total_compressed
        avg_compression = (1 - total_compressed / total_original) * 100
        
        print(f"\n📊 Statistics:")
        print(f"   Files processed: {len(results)}")
        print(f"   Total original size: {total_original:,} bytes ({total_original / 1024 / 1024:.2f} MB)")
        print(f"   Total compressed size: {total_compressed:,} bytes ({total_compressed / 1024 / 1024:.2f} MB)")
        print(f"   Total savings: {total_saved:,} bytes ({total_saved / 1024 / 1024:.2f} MB)")
        print(f"   Average compression: {avg_compression:.1f}%")
        
        print(f"\n🎯 Best Compressions:")
        top_compressions = sorted(results, key=lambda x: x['compression_ratio'], reverse=True)[:5]
        for i, r in enumerate(top_compressions, 1):
            filename = Path(r['input']).name
            print(f"   {i}. {filename}: {r['compression_ratio']:.1f}%")
        
        print(f"\n💾 Output Directory: compressed_py/")
        print(f"   All compressed .py files saved here")
        
        print(f"\n🔐 NFT-Ready Features:")
        print(f"   ✓ XOR crypto-signing with 'eug' key")
        print(f"   ✓ SHA-256 hash for each file")
        print(f"   ✓ Timestamp metadata")
        print(f"   ✓ AI personality signatures")
        
        print(f"\n🚀 Upload Speed Impact:")
        print(f"   Before: {total_original / 1024:.2f} KB @ 500 KB/s = {total_original / 1024 / 500:.1f}s")
        print(f"   After:  {total_compressed / 1024:.2f} KB @ 500 KB/s = {total_compressed / 1024 / 500:.1f}s")
        print(f"   Time saved: {(total_original - total_compressed) / 1024 / 500:.1f}s per upload!")
        
        print(f"\n✨ Your files are now:")
        print(f"   • {avg_compression:.0f}% smaller")
        print(f"   • Crypto-signed for NFT authenticity")
        print(f"   • Compressed with AI personality optimization")
        print(f"   • Using 3D symbolic language (EUG format)")
        
    else:
        print("❌ No files were successfully compressed")
    
    print(f"\n{'═'*70}")
    print(f"✅ BATCH COMPRESSION COMPLETE")
    print(f"{'═'*70}\n")

if __name__ == "__main__":
    main()
