import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NewsWithSummary } from './news.type';
import FormData from 'form-data';
import { ImageService } from './image.service';

interface ApiResponse {
  response: {
    cursor: number;
    results: any;
    count: number;
    remaining: number;
  };
}

@Injectable()
export class BubbleService implements OnModuleInit {
  private readonly apiUrl =
    'https://bizzline-52212.bubbleapps.io/version-test/api/1.1/obj';
  private readonly apiToken: string;
  private tags: { [key: string]: any } = {};
  private companies: { [key: string]: any } = {};

  constructor(
    private httpService: HttpService,
    private config: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly imageService: ImageService,
  ) {
    this.apiToken = this.config.get('BUBBLE_API_KEY');
  }
  onModuleInit() {
    this.refreshCache();
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async refreshCache() {
    Logger.log(`[${this.constructor.name}] Refreshing cache... `);

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/company`),
      );
      this.companies = response?.data?.response?.results?.reduce(
        (acc, company) => {
          acc[company.Slug] = company._id; // Spread operator to include all company data
          return acc;
        },
        {},
      );

      const twoHoursInMilliseconds = 2 * 60 * 60 * 1000;
      await this.cacheManager.set(
        'companies',
        this.companies,
        twoHoursInMilliseconds,
      );

      const tagsResponse = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/tags`),
      );
      this.tags = tagsResponse.data.response.results.reduce((acc, tag) => {
        acc[tag.name_text] = tag._id; // Use tag name_text as the key
        return acc;
      }, {});
      await this.cacheManager.set('tags', this.tags, 7200);

      Logger.log(
        `[${this.constructor.name}] Cache refreshed ${
          Object.keys(this.companies).length
        } companies and ${Object.keys(this.tags).length} tags`,
      );
    } catch (error) {
      Logger.error(`Error refreshing cache: ${error.message}`);
    }
  }

  // Method to fetch data (example)
  async getApiPost(id: string) {
    Logger.debug(`[${this.constructor.name}] Fetching post with id: ${id}`);
    const url = `${this.apiUrl}/post/${id}`;
    return firstValueFrom(
      this.httpService
        .get(url, {
          headers: { Authorization: `Bearer ${this.apiToken}` },
        })
        .pipe(map((response) => response.data)),
    );
  }

  // Method to create a post
  async createPost(data: NewsWithSummary) {
    // Directly access the cache to get companies and tags
    //const companies = await this.cacheManager.get<{ [key: string]: any }>(
    //  'companies',
    //);
    //const tags = await this.cacheManager.get<{ [key: string]: any }>('tags');

    const imgB64 = await this.imageService.imageUrlToOptimizedWebPBase64(
      data.imageUrl,
    );

    const formData = new FormData();
    //formData.append('image_urls_list_text', `["${data.imageUrl}"]`);
    formData.append('post_body_text', data.article);
    formData.append('post_title_text', data.title);
    formData.append(
      'posted_by__company__custom_company',
      this.companies[data.company],
    );
    formData.append('tags_list_custom_tags', `["${this.tags[data.tag]}"]`);
    formData.append('top_post_boolean', 'false');
    formData.append('post_date_date', data.date.toISOString());
    formData.append('is_api_boolean', 'true');
    formData.append(
      'posted_by__user__user',
      '1602529909058x625996378652707500',
    );
    if (imgB64 !== '') {
      formData.append('images_list_image', `["${imgB64}"]`);
    }
    formData.append('post_summary_text', data.summary);
    //formData.append('Slug', this.createSLug(data.title));

    const url = `${this.apiUrl}/post`;
    const headers = {
      ...formData.getHeaders(),
      Authorization: `Bearer ${this.apiToken}`,
      maxBodyLength: Infinity,
    };
    return firstValueFrom(
      this.httpService.post(url, formData, {
        headers,
      }),
      //.pipe(map((response) => response.data)),
    );
  }

  private createSLug(title: string) {
    return title
      .toLowerCase() // Convert to lowercase
      .replace(/[^a-z0-9 -]/g, '') // Remove invalid chars
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/-+/g, '-'); // Replace multiple - with single -
  }

  async getLatestPostForCompany(
    company: string,
  ): Promise<NewsWithSummary | null> {
    const constraints = [
      {
        key: 'is Api',
        constraint_type: 'equals',
        value: 'true',
      },
      {
        key: 'posted_by__company__custom_company',
        constraint_type: 'equals',
        value: this.companies[company],
      },
    ];

    const url = `${this.apiUrl}/post?constraints=${encodeURIComponent(JSON.stringify(constraints))}&sort_field=post_date_date&descending=true&limit=1`;
    const response = await firstValueFrom(
      this.httpService
        .get<ApiResponse>(url, {
          headers: { Authorization: `Bearer ${this.apiToken}` },
        })
        .pipe(map((response) => response.data)),
    );

    // Check if there are any results
    if (response?.response?.results?.length > 0) {
      const post = response.response.results[0];

      // Map the API response to NewsWithSummary type
      const newsWithSummary: NewsWithSummary = {
        title: post.post_title_text,
        link: '', // The API response does not seem to contain a direct link field
        date: new Date(post.post_date_date),
        source: '',
        company: company,
        imageUrl: null, // image to big as it is base64
        summary: post.post_summary_text,
        article: post.post_body_text,
        tag: null,
      };

      return newsWithSummary;
    }

    return null;
  }
}
