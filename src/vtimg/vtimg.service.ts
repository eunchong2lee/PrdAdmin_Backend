import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as puppeteer from 'puppeteer';
import { HealthFoodData } from 'src/HealthFoodData/entities/HealthFoodData.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import {
  BlobServiceClient,
  BlockBlobClient,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

@Injectable()
export class VtimgService {
  constructor(
    @InjectRepository(HealthFoodData)
    private readonly VtestRepository: Repository<HealthFoodData>,
    private readonly httpService: HttpService,
  ) {}

  async postimage() {
    try {
      const datas = await this.VtestRepository.query(
        `
            SELECT *
            FROM health_food_data`,
      );
      // Azure Storage resource name
      const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
      if (!accountName) throw Error('Azure Storage accountName not found');

      // Azure Storage resource key
      const accountKey = process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY;
      if (!accountKey) throw Error('Azure Storage accountKey not found');

      // Create credential
      const sharedKeyCredential = new StorageSharedKeyCredential(
        accountName,
        accountKey,
      );
      const baseUrl = `https://${accountName}.blob.core.windows.net/crawl/`;
      const containerName = `HealthFoodData`;
      const blobServiceClient = new BlobServiceClient(
        `${baseUrl}`,
        sharedKeyCredential,
      );
      const containerClient = await blobServiceClient.getContainerClient(
        containerName,
      );

      const browser = await puppeteer.launch({ headless: true });
      for (let i = 0; i < datas.length / 10; i++) {
        const new_datas = datas.slice(i * 10, 10 + i * 10);
        for (const data of new_datas) {
          // await Promise.all(
          // new_datas.map(async (data) => {
          if (data.PRMS_IMG == null && data.PRDUCT != null) {
            const blockBlobClient = containerClient.getBlockBlobClient(
              data.PRDUCT,
            );
            const URL = `https://www.google.com`;
            const page = await browser.newPage();
            try {
              let name;
              if (data.ENTRPS && data.PRDUCT) {
                name = `${data.ENTRPS} ${data.PRDUCT}`;
              } else {
                name = `${data.PRDUCT}`;
              }
              await page.goto(URL);
              await page.reload();

              await page.click('.SDkEP .a4bIc .gLFyf');
              await page.keyboard.type(name);
              await page.keyboard.press('Enter');

              await page.waitForNavigation();
              await page.waitForSelector(
                '#hdtb-msb > div:nth-child(1) > div > div:nth-child(2)',
              );

              // #hdtb-msb > div:nth-child(1) > div > div:nth-child(3)

              await page.click(
                '#hdtb-msb > div:nth-child(1) > div > div:nth-child(2)',
              );
              await page.waitForNavigation();

              const check = await page.evaluate(() => {
                const img = document.querySelector(
                  'a.wXeWr.islib.nfEiy > div.bRMDJf.islir > img',
                );
                return { img };
              });
              if (!check.img) {
                await page.click(
                  '#hdtb-msb > div:nth-child(1) > div > div:nth-child(3)',
                );
                await page.waitForNavigation();
              }

              // 이미지

              const result = await page.evaluate(() => {
                // let img;
                const img = document
                  .querySelector('a.wXeWr.islib.nfEiy > div.bRMDJf.islir > img')
                  .getAttribute('src');
                // if (imgEl) {
                //   img = imgEl.src;
                // }
                //#islrg > div.islrc > div:nth-child(2) > a.wXeWr.islib.nfEiy > div.bRMDJf.islir
                return { img };
              });
              let url;

              if (result.img) {
                const imgResult = await this.httpService.axiosRef.get(
                  result.img.replace(/\?.*$/, ''),
                  {
                    responseType: 'arraybuffer',
                  },
                );

                // fs.writeFileSync(`poster/${data.PRDUCT}.jpg`, imgResult.data);
                await blockBlobClient.uploadData(imgResult.data);
                url = blockBlobClient.url;
                // data.PRMS_IMG = url;

                await this.VtestRepository.update(data._id, data);
              }
            } catch (e) {
              throw new BadRequestException(e.response);
            }

            await page.close();
          }
        }
      }

      await browser.close();

      return 'complete';
    } catch (e) {
      throw new BadRequestException(e.response);
    }
  }
}
