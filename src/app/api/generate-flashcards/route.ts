import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { notes, cardCount = 5 } = await req.json();

    if (!notes) {
      return NextResponse.json(
        { error: 'Notes are required' },
        { status: 400 }
      );
    }

    console.log(`Generating ${cardCount} flashcards...`);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: "You are a helpful AI that creates flashcards from study notes. Create flashcards with clear, concise questions and answers. Each flashcard should focus on a single concept or fact. Return the exact number of flashcards requested by the user."
        },
        {
          role: "user",
          content: `Create exactly ${cardCount} unique flashcards from these notes. This is very important: you must generate exactly ${cardCount} cards, no more and no less. Format your response as a JSON object with a 'flashcards' array containing exactly ${cardCount} objects, each with 'question' and 'answer' fields.

Study notes: ${notes}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const response = JSON.parse(completion.choices[0].message.content || '{"flashcards": []}');

    // Validate the response has the correct number of flashcards
    if (!response.flashcards || !Array.isArray(response.flashcards)) {
      throw new Error('Invalid response format from OpenAI');
    }

    if (response.flashcards.length !== cardCount) {
      // If we didn't get the right number of cards, make another attempt
      // with a more explicit instruction
      const retryCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `You are a flashcard generation AI. You must ALWAYS generate exactly the number of flashcards requested. Current request: ${cardCount} flashcards.`
          },
          {
            role: "user",
            content: `IMPORTANT: Generate EXACTLY ${cardCount} flashcards. No more, no less.
            
Format each flashcard as a JSON object with 'question' and 'answer' fields.
The response must be a JSON object with a 'flashcards' array containing exactly ${cardCount} flashcard objects.

Study notes: ${notes}

Remember: The response MUST contain exactly ${cardCount} flashcards.`
          }
        ],
        response_format: { type: "json_object" },
      });

      const retryResponse = JSON.parse(retryCompletion.choices[0].message.content || '{"flashcards": []}');
      
      if (!retryResponse.flashcards || retryResponse.flashcards.length !== cardCount) {
        throw new Error(`Failed to generate exactly ${cardCount} flashcards`);
      }

      return NextResponse.json(retryResponse);
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Detailed error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate flashcards', 
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}