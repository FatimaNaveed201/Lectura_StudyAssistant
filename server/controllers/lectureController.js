require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const fs = require('fs');
const axios = require('axios');
const pdfParse = require('pdf-parse');

exports.processLecture = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const dataBuffer = fs.readFileSync(file.path);
    const pdfData = await pdfParse(dataBuffer);

    const prompt = `
    You are a lecture assistant. Based on the content below, perform the following tasks and output in the specified format for a website display:

    1. Wrap the summary inside a "Summary Box" like this:
    Summary:
    [START BOX]
    Your summarized paragraph here.
    [END BOX]

    2. Generate exactly 6 flashcards using this format:
    Flashcards:
    - Q: What is the question?
    A: Correct answer.
    - Q: Another question?
    A: Its answer.

    3. Generate 5 properly styled multiple choice questions like this:
    Quiz:
    1. What is the main concept discussed?
    a) Option A
    b) Option B
    c) Option C
    d) Option D  
    ✅ Answer: b

    Lecture content:
    ${pdfData.text}
    `;


    const response = await axios.post(
      'https://api.cohere.ai/v1/chat',
      {
        model: 'command-r-plus',  // ✅ Use chat-compatible model
        message: prompt,
        temperature: 0.5,
        max_tokens: 800
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    fs.unlinkSync(file.path);

    const generatedText = response.data.text?.trim() || 'No response generated.';
    res.json({ result: generatedText });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to process lecture file' });
  }
};
