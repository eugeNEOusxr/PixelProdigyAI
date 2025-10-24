# 🧬 WordWeaver Format Engine Guide

## Overview

The **WordWeaver Format Engine** brings professional word processor formatting preferences to PixelProdigy's 3D text universe. Writers can now apply Microsoft Word, Google Docs, Blog, PDF, and Manuscript formatting standards to their 3D documents.

---

## 📋 Format Profiles

### 1. **Microsoft Word** 📘
*Default office document standard*

- **Page Size:** 8.5" × 11" (Letter)
- **Margins:** 1.0" all sides
- **Font:** Calibri (default Word font)
- **Font Size:** 0.4 (12pt equivalent)
- **Line Height:** 1.15 (Word default)
- **Paragraph Spacing:** 0.5 units
- **First Line Indent:** 0.5"
- **Alignment:** Left
- **Heading Scales:**
  - H1: 2.0× body size
  - H2: 1.5× body size
  - H3: 1.17× body size
- **Colors:**
  - Body: Black (#000000)
  - Headings: Blue (#2E75B6)
  - Links: Blue (#0563C1)

**Best for:** Professional documents, business reports, resumes, cover letters

---

### 2. **Google Docs** 📗
*Modern collaborative writing standard*

- **Page Size:** 8.5" × 11"
- **Margins:** 1.0" all sides
- **Font:** Arial
- **Font Size:** 0.36 (11pt default)
- **Line Height:** 1.15
- **Paragraph Spacing:** 0.4 units
- **First Line Indent:** None (0)
- **Alignment:** Left
- **Heading Scales:**
  - H1: 1.82× body size
  - H2: 1.45× body size
  - H3: 1.27× body size
- **Colors:**
  - All text: Black (#000000)
  - Links: Blue (#1155CC)

**Best for:** Team collaboration, shared documents, quick drafts

---

### 3. **Blog Post** 📝
*Web-optimized reading experience*

- **Page Size:** 12" × 20" (wider, taller)
- **Margins:** 1.5" top/bottom, 2.0" left/right
- **Font:** Georgia (serif for readability)
- **Font Size:** 0.38
- **Line Height:** 1.6 (increased for web reading)
- **Paragraph Spacing:** 0.8 units (generous white space)
- **First Line Indent:** None
- **Alignment:** Left
- **Heading Scales:**
  - H1: 2.5× body size (large titles)
  - H2: 1.8× body size
  - H3: 1.4× body size
- **Colors:**
  - Body: Dark gray (#333333)
  - Headings: Near-black (#1a1a1a)
  - Links: Blue (#0066cc)

**Best for:** Blog posts, online articles, personal narratives, newsletters

---

### 4. **PDF Document** 📄
*Academic and formal publishing*

- **Page Size:** 8.5" × 11"
- **Margins:** 1.0" top/bottom, 1.25" left/right
- **Font:** Times New Roman (academic standard)
- **Font Size:** 0.4 (12pt)
- **Line Height:** 2.0 (double-spaced)
- **Paragraph Spacing:** None (0)
- **First Line Indent:** 0.5"
- **Alignment:** Justified (clean edges)
- **Heading Scales:**
  - H1: 1.5× body size
  - H2: 1.3× body size
  - H3: 1.15× body size
- **Colors:**
  - All text: Black (#000000) for printing

**Best for:** Academic papers, research documents, formal reports, dissertations

---

### 5. **Manuscript** 📖
*Industry-standard screenplay/novel format*

- **Page Size:** 8.5" × 11"
- **Margins:** 1.0" top/bottom, 1.5" left, 1.0" right
- **Font:** Courier New (monospaced, 10 chars/inch)
- **Font Size:** 0.42 (12pt Courier)
- **Line Height:** 2.0 (double-spaced)
- **Paragraph Spacing:** None
- **First Line Indent:** 0.5"
- **Alignment:** Left (ragged right edge)
- **Heading Scales:**
  - All headings: 1.0× (same size as body)
- **Colors:**
  - All text: Black (#000000)

**Best for:** Novels, screenplays, stage plays, literary submissions

---

## ⚙️ Custom Writer Preferences

### Adjustable Parameters

Writers can override any format profile with custom preferences:

#### **Font Size** (0.2 - 0.8)
- Smaller: 0.2 (compact, data-heavy documents)
- Larger: 0.8 (accessibility, presentations)
- Default: Varies by format (0.36-0.42)

#### **Line Height** (1.0 - 3.0)
- Single: 1.0 (compact)
- Standard: 1.15-1.6 (readable)
- Double: 2.0 (academic/manuscript)
- Triple: 3.0 (extreme spacing)

#### **Paragraph Spacing** (0 - 1.5)
- None: 0 (continuous text)
- Small: 0.3-0.5 (subtle breaks)
- Large: 0.8-1.5 (generous white space)

#### **First Line Indent** (0 - 1.5)
- None: 0 (modern web style)
- Standard: 0.5" (traditional books)
- Deep: 1.0-1.5" (creative emphasis)

---

## 🎯 UI Controls

### Format Profile Buttons

Located at the top of WordWeaver workspace:

```
[📘 Word]  [📗 Google]  [📝 Blog]  [📄 PDF]  [📖 Script]
```

- Click any button to instantly apply that format's defaults
- Active format highlighted with blue glow
- Format settings display shows current configuration

### Custom Preference Sliders

Four sliders for real-time customization:

1. **Font Size** - Adjust text scale
2. **Line Height** - Control vertical spacing
3. **Paragraph Spacing** - Set gaps between paragraphs
4. **First Line Indent** - Traditional paragraph indentation

### Preference Management

Three action buttons:

- **💾 Save Preferences** - Store custom settings to browser localStorage
- **📥 Load Preferences** - Restore previously saved settings
- **🔄 Reset** - Clear custom changes, return to format defaults

---

## 📐 3D Space Mapping

### How Formatting Translates to 3D

**Page Geometry:**
- White plane mesh represents physical page
- Dimensions match format profile (8.5"×11" or custom)
- Subtle gray margin guide lines show content boundaries

**Text Positioning:**
```javascript
// Starting position (top-left of content area)
startX = -pageWidth/2 + marginLeft
startY = pageHeight/2 - marginTop

// Line-by-line Y descent
y = startY - (lineNumber × fontSize × lineHeight)

// Character-by-character X advance
x = startX + (columnPosition × fontSize × 0.6)
```

**Heading Adjustments:**
- Scale: Headings multiply fontSize by headingScale (H1=2.0×, etc.)
- Color: Distinct colors (blue for Word, black for PDF)
- Extrusion: Deeper 3D depth for emphasis

**Material Properties:**
- Body text: `MeshStandardMaterial` with low metalness (0.1)
- Roughness: 0.5-0.6 for realistic finish
- Shadow casting: All letters cast/receive shadows

---

## 💡 Usage Examples

### Example 1: Professional Resume (Word Format)

```javascript
// Select Microsoft Word format
selectFormatProfile('word');

// Default settings are already optimal:
// - Margins: 1" all sides
// - Font: Calibri
// - Line height: 1.15
// - Heading color: Blue

// Input your resume text and click "Materialize"
```

**Result:** Clean, professional layout with blue headings and proper margins

---

### Example 2: Blog Post with Custom Spacing

```javascript
// Start with Blog format
selectFormatProfile('blog');

// Customize for your style
updateCustomFormat({
  fontSize: 0.45,           // Slightly larger text
  lineHeight: 1.8,          // Extra breathing room
  paragraphSpacing: 1.0,    // Generous gaps
  indentFirstLine: 0        // No indent (modern web)
});

// Save for future posts
saveFormatPreferences();
```

**Result:** Spacious, easy-to-read web layout optimized for long-form content

---

### Example 3: Academic Paper (PDF Format)

```javascript
// Select PDF format
selectFormatProfile('pdf');

// Academic standards already set:
// - Double-spaced (lineHeight: 2.0)
// - Times New Roman font
// - Justified alignment
// - 0.5" first-line indent

// Perfect for:
// - Research papers
// - Dissertations
// - Formal reports
```

**Result:** Print-ready academic document following standard guidelines

---

### Example 4: Screenplay (Manuscript Format)

```javascript
// Select Manuscript format
selectFormatProfile('manuscript');

// Industry-standard screenplay format:
// - Courier New 12pt
// - 1.5" left margin (binding space)
// - Double-spaced
// - All elements same font size

// Ideal for script submissions
```

**Result:** Industry-compliant manuscript ready for agents/publishers

---

## 🔧 Technical Integration

### Format Engine Class

```javascript
class WordWeaverFormatEngine {
  constructor(scene, camera) {
    this.formatProfiles = { word, google, blog, pdf, manuscript };
    this.currentFormat = 'word';
    this.customPreferences = {};
  }
  
  setFormat(profileName) { /* Switch active profile */ }
  
  applyWriterPreferences(prefs) { /* Override defaults */ }
  
  createDocumentPage(pageNumber, positionZ) { 
    /* Generate 3D page with margins */ 
  }
  
  calculateTextPosition(lineNum, colPos, elementType) {
    /* Compute 3D coordinates from format rules */
  }
  
  create3DText(text, elementType, position) {
    /* Generate TextGeometry with formatting */
  }
}
```

### Integration Points

**Initialization:**
```javascript
// In WordWeaver workspace initialization:
formatEngine = new WordWeaverFormatEngine(scene, camera);
selectFormatProfile('word');
create3DDocumentPage(1, 0);
```

**Text Materialization:**
```javascript
// When creating 3D text:
const position = formatEngine.calculateTextPosition(lineNum, colPos, 'h1');
const mesh = await formatEngine.create3DText(text, 'h1', position);
```

**Preference Persistence:**
```javascript
// Save to localStorage:
localStorage.setItem('wordweaver_format_preferences', 
  formatEngine.exportFormatSettings());

// Load from localStorage:
const saved = localStorage.getItem('wordweaver_format_preferences');
formatEngine.importFormatSettings(saved);
```

---

## 🎨 Visual Feedback

### Format Settings Display

Real-time display under format buttons:

```
📋 Microsoft Word Format
Margins: 1.0"/1.0"/1.0"/1.0" • Line Height: 1.15 • Font: Calibri • Indent: 0.5"
```

Updates automatically when:
- Format profile changes
- Custom sliders adjust
- Preferences load from storage

### Slider Value Display

Each slider shows current value:

```
Font Size:            [======>    ] 0.40
Line Height:          [====>      ] 1.15
Paragraph Spacing:    [====>      ] 0.50
First Line Indent:    [====>      ] 0.50
```

Live updates as you drag sliders.

---

## 📊 Comparison Chart

| Feature           | Word  | Google | Blog  | PDF   | Manuscript |
|-------------------|-------|--------|-------|-------|------------|
| Line Height       | 1.15  | 1.15   | 1.6   | 2.0   | 2.0        |
| Para Spacing      | 0.5   | 0.4    | 0.8   | 0     | 0          |
| First Indent      | 0.5"  | 0      | 0     | 0.5"  | 0.5"       |
| Alignment         | Left  | Left   | Left  | Just. | Left       |
| H1 Scale          | 2.0×  | 1.82×  | 2.5×  | 1.5×  | 1.0×       |
| Font              | Calib | Arial  | Georg | Times | Courier    |
| Page Width        | 8.5"  | 8.5"   | 12"   | 8.5"  | 8.5"       |
| Heading Color     | Blue  | Black  | Black | Black | Black      |
| **Best For**      | Prof  | Team   | Web   | Print | Literary   |

---

## 🚀 Future Enhancements

### Planned Features

1. **File Format Import**
   - Parse .docx files (extract styles, fonts, spacing)
   - Parse .pdf files (maintain layout)
   - Parse .txt/.md files (apply format to plain text)

2. **Style Libraries**
   - Save named style presets ("My Blog Style", "Work Reports")
   - Share format profiles with team
   - Import community format templates

3. **Advanced Typography**
   - Drop caps (large first letter)
   - Pull quotes (emphasized excerpts)
   - Footnotes and endnotes
   - Multi-column layouts

4. **Collaborative Features**
   - Track changes visualization
   - Comment threads in 3D space
   - Version history replay

5. **Export Options**
   - Generate PDF from 3D scene
   - Export to DOCX with formatting preserved
   - Screenshot with embedded metadata

---

## 📖 Best Practices

### Choosing the Right Format

**Use Word format when:**
- Creating professional business documents
- Need familiar office document appearance
- Sharing with corporate environments
- Printing on standard paper

**Use Google Docs format when:**
- Collaborating with teams
- Need quick, clean drafts
- Working on shared projects
- Want minimal styling decisions

**Use Blog format when:**
- Writing for web audiences
- Creating long-form content
- Need excellent readability
- Want generous white space

**Use PDF format when:**
- Writing academic papers
- Need formal, print-ready documents
- Following strict formatting guidelines
- Preparing for publication

**Use Manuscript format when:**
- Writing novels or screenplays
- Submitting to agents/publishers
- Following industry standards
- Need precise page count estimates

### Customization Tips

1. **Start with a profile** - Don't build from scratch
2. **Adjust incrementally** - Small changes, big impact
3. **Test readability** - Camera distance affects legibility
4. **Save your work** - Use localStorage for persistence
5. **Reset if needed** - Don't fear experimentation

---

## ❓ Troubleshooting

### Format not applying?
- Check if `formatEngine` is initialized (console.log)
- Ensure WordWeaver workspace is active
- Verify format profile buttons are visible

### Sliders not updating?
- Make sure `updateCustomFormat()` is called on input
- Check browser console for JavaScript errors
- Try resetting to defaults with 🔄 Reset button

### Saved preferences not loading?
- Check browser localStorage is enabled
- Verify data exists: `localStorage.getItem('wordweaver_format_preferences')`
- Try saving again with 💾 Save Preferences

### Text positioning looks wrong?
- Verify page margins match content boundaries
- Check `calculateTextPosition()` logic
- Ensure lineNumber and columnPosition are correct

---

## 📚 References

### Format Standards Sources

- **Microsoft Word Defaults:** [Microsoft Style Guide](https://docs.microsoft.com/en-us/style-guide/)
- **Google Docs Defaults:** [Google Workspace Updates](https://support.google.com/docs/)
- **Web Typography:** [A Book Apart - Web Typography](https://abookapart.com/)
- **Academic Formatting:** [APA Style Guide](https://apastyle.apa.org/), [MLA Handbook](https://style.mla.org/)
- **Manuscript Format:** [Shunn Standard Manuscript Format](https://www.shunn.net/format/)

### Related Documentation

- `/INTEGRATION_MASTER.md` - System architecture overview
- `/API_ARCHITECTURE.md` - Backend API for storage
- `/DOCUMENTATION_INDEX.md` - Complete file navigator
- `/AI_COMMAND_PROTOCOL.md` - AI personality integration

---

## 🎓 Conclusion

The **WordWeaver Format Engine** bridges the gap between traditional word processing and PixelProdigy's 3D creative universe. Writers can now bring their familiar formatting preferences into immersive 3D space, creating documents that **look exactly how they want them to appear**.

Whether you're crafting professional resumes, collaborative reports, engaging blog posts, academic papers, or literary manuscripts, the Format Engine respects your procedural formatting preferences and translates them beautifully into 3D geometry.

**Your words, your format, your 3D universe.** 🧬✨

---

*Eugene Ousos - PixelProdigy AI*  
*October 24, 2025*
