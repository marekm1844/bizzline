import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NewsWithSummary } from './news.type';
import { Model } from 'mongoose';

@Injectable()
export class NewsRepository {
  constructor(
    @InjectModel('News') private readonly newsModel: Model<NewsWithSummary>,
  ) {}

  async create(news: NewsWithSummary) {
    const createdNews = new this.newsModel(news);
    return await createdNews.save();
  }

  async findAll() {
    return await this.newsModel.find().exec();
  }

  async getLatestNewsDate(companyName: string): Promise<Date | null> {
    const query = companyName ? { company: companyName } : {};
    Logger.debug(`Query: ${JSON.stringify(query)}`);
    const latestNews = await this.newsModel
      .findOne(query) // Apply the filter if companyName is provided
      .sort({ date: -1 }) // Sort by date in descending order
      .exec();

    return latestNews ? new Date(latestNews.date) : null;
  }

  async findByCompanyAndDate(
    company: string,
    date: Date,
  ): Promise<NewsWithSummary[]> {
    return this.newsModel.find({ company, date }).exec();
  }
}
