
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_TEXT_MODEL } from '../constants';

// Khởi tạo client GoogleGenAI bằng khóa API từ biến môi trường.
// Theo hướng dẫn, chúng tôi giả định process.env.API_KEY có sẵn và hợp lệ.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
