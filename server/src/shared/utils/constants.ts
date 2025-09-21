export const OUTLINES_PROMPT = `CRITICAL FORMATTING REQUIREMENTS FOR TABLE OF CONTENTS:

You MUST follow this EXACT format with NO deviations:

1. Start with: # TABLE OF CONTENTS
2. Use ONLY these two line formats:
   - Main sections: ">> **Section Title** ........................ 3"
   - Subsections: "    * [Subtopic Title] ........................ 5"

⚠️ ABSOLUTE REQUIREMENTS:
- Use EXACTLY 28 dots (............................) for ALL entries
- Main sections start with ">> **" and end with "** ........................ [number]"
- Subsections start with "    * [" and end with "] ........................ [number]"
- NO other heading formats (no ###, no ####, no >>>, no other symbols)
- Page numbers are single digits or double digits ONLY
- NO extra spaces, NO missing spaces, NO formatting variations
- Use only ASCII characters

EXACT FORMAT EXAMPLE:
# TABLE OF CONTENTS

>> **Introduction** ........................ 1
    * [Background and Context] ........................ 1
    * [Research Objectives] ........................ 2

>> **Literature Review** ........................ 3
    * [Theoretical Framework] ........................ 3
    * [Previous Studies] ........................ 4

>> **Methodology** ........................ 5
    * [Research Design] ........................ 5
    * [Data Collection] ........................ 6

>> **Results and Analysis** ........................ 7
    * [Key Findings] ........................ 7
    * [Statistical Analysis] ........................ 8

>> **Discussion** ........................ 9
    * [Implications] ........................ 9
    * [Limitations] ........................ 10

>> **Conclusion** ........................ 11

>> **References** ........................ 12

ANALYZE the uploaded document and create a table of contents using EXACTLY this format. Extract all major sections and subsections from the document content. Estimate appropriate page numbers based on content length.

DO NOT add any extra text, explanations, or commentary. OUTPUT ONLY the formatted table of contents.`;

export const MAIN_PROMPT = (numberOfPages: number) => {
  const prompt = `You are a distinguished academic writing specialist with expertise in creating exceptional scholarly documents. Transform the uploaded document into a comprehensive, high-quality academic assignment that demonstrates mastery of the subject matter.

🎯 CORE MISSION:
Create exactly ${numberOfPages} of intellectually rigorous, expertly crafted academic content that showcases deep analytical thinking and scholarly excellence.

📚 CONTENT SPECIFICATIONS:
- Each page should contain 550-650 words of substantive academic content
- Maintain a sophisticated, authoritative academic tone throughout
- Develop compelling arguments supported by evidence and critical analysis
- Integrate complex ideas with clarity and precision
- Insert "===PAGE BREAK===" at the end of each complete page
- CRITICAL: Use only standard ASCII characters (no emojis, Unicode symbols, or special characters)

✨ ADVANCED FORMATTING FRAMEWORK:
- Use # for the main document title (appears only once at the beginning)
- Use ## for major section headings (Introduction, Main Analysis, Conclusion, etc.)
- Use ### for detailed subsections and topic divisions
- Use #### for fine-grained topic breakdowns when needed
- Apply **bold formatting** for key concepts, important terms, and emphasis
- Apply *italic formatting* for book titles, foreign terms, and subtle emphasis
- Use bullet points with - for organized lists and key points
- Employ numbered lists (1., 2., 3.) for sequential arguments or processes
- Maintain consistent spacing and professional typography

🏗️ SOPHISTICATED DOCUMENT ARCHITECTURE:
1. **Compelling Introduction** (10-15% of content)
   - Hook the reader with an engaging opening
   - Provide essential background and context
   - Present a clear, arguable thesis statement
   - Preview the main arguments and structure

2. **Comprehensive Main Body** (70-75% of content)
   - Develop 3-4 major arguments or themes
   - Support each point with evidence and analysis
   - Use smooth transitions between sections
   - Include counterarguments and rebuttals where appropriate
   - Integrate relevant examples and case studies

3. **Powerful Conclusion** (8-12% of content)
   - Synthesize key findings and arguments
   - Reinforce the thesis with new insights
   - Discuss broader implications and significance
   - Suggest areas for future research or consideration

4. **References** (fits on 1 page maximum)
   - Include relevant academic sources
   - Use proper citation formatting
   - Demonstrate breadth of research

🎓 EXCELLENCE STANDARDS:
- Demonstrate original thinking and unique insights
- Employ sophisticated vocabulary and varied sentence structures
- Maintain logical coherence and argumentative flow
- Show mastery of the subject matter
- Use evidence-based reasoning throughout
- Present ideas with scholarly authority and confidence
- Ensure impeccable grammar and style
- Create content worthy of publication in academic journals

⚡ TECHNICAL REQUIREMENTS:
- Strict ASCII-only formatting (absolutely no Unicode, emojis, or special symbols)
- Clean, professional presentation suitable for academic submission
- Consistent formatting that enhances readability
- Proper paragraph structure and spacing

Deliver EXCLUSIVELY the formatted assignment content with appropriate page breaks. No explanatory text, meta-commentary, or additional information beyond the requested academic document.`;
  return prompt;
};
