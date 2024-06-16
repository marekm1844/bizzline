import mongoose from 'mongoose';

export enum NewsTag {
  Team = 'Team',
  Funding = 'Funding',
  Partnership = 'Partnership',
  Product = 'Product',
  Legal = 'Legal',
  Milestone = 'Milestone',
  Acquisition = 'Acquisition',
}

export type News = {
  title: string;
  link: string;
  date: Date;
  source: string;
  company: string;
  imageUrl: string;
  coverImageUrl?: string;
};

export type NewsWithArticle = News & {
  innerText: string;
};

export type NewsWithSummary = News & {
  summary: string;
  article: string;
  tag: NewsTag;
  hasDate: boolean;
};

export const NewsSchema = new mongoose.Schema({
  title: String,
  link: String,
  date: Date,
  source: String,
  company: String,
  article: String,
  summary: String,
  imageUrl: String,
  tag: {
    type: String,
    required: true,
    enum: Object.values(NewsTag), // Ensure the tag value is one of the enum values
  },
});
