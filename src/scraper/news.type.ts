import mongoose from 'mongoose';

export type News = {
  title: string;
  link: string;
  date: Date;
  source: string;
  company: string;
};

export type NewsWithArticle = News & {
  innerText: string;
};

export type NewsWithSummary = News & {
  summary: string;
  article: string;
};

export const NewsSchema = new mongoose.Schema({
  title: String,
  link: String,
  date: Date,
  source: String,
  company: String,
  article: String,
  summary: String,
});