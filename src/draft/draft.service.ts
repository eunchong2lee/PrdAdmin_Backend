import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Draft, DraftImage } from './entities/draft.entity';
import { v4 as uuidv4 } from 'uuid';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';

@Injectable()
export class DraftService {
  constructor(
    @InjectRepository(Draft)
    private readonly DraftRepository: Repository<Draft>,
    @InjectRepository(DraftImage)
    private readonly DraftImageRepository: Repository<DraftImage>,
  ) {}

  async getDraft(id) {
    try {
      console.log(id);
      const [draft] = await this.DraftRepository.query(`
        SELECT * FROM DRAFT WHERE _id = "${id}"`);

      return { draft };
    } catch (err) {
      console.log(err.message);
    }
  }

  async postDraft(draft, id) {
    try {
      if (draft) {
        const newDraft = new Draft();
        newDraft.text = draft;
        newDraft.PRDUCT_ID = id;

        await this.DraftRepository.save(newDraft);

        return { data: { message: 'success', data: newDraft } };
      }
    } catch (err) {
      console.log(err.message);
    }
  }

  async postDraftImage(image, id) {
    try {
      if (image) {
        // const newDraftImage = new DraftImage();
        // // 읽기 전용
        // //   const stream = intoStream(optimized) as Readable;
        // // const containerClient =
        // //   blobServiceClient.getContainerClient(containerName);
        // // const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // // azure blob
        // const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
        // if (!accountName) throw Error('Azure Storage accountName not found');

        // // Azure Storage resource key
        // const accountKey = process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY;
        // if (!accountKey) throw Error('Azure Storage accountKey not found');
        // // Create credential
        // const sharedKeyCredential = new StorageSharedKeyCredential(
        //   accountName,
        //   accountKey,
        // );

        // const baseUrl = `https://${accountName}.blob.core.windows.net/crawl/`;
        // const containerName = `HealthFoodFile`;
        // const blobServiceClient = new BlobServiceClient(
        //   `${baseUrl}`,
        //   sharedKeyCredential,
        // );
        // const containerClient = await blobServiceClient.getContainerClient(
        //   containerName,
        // );

        // const split_data = image.originalname.split('.');
        // const extension = split_data[split_data.length - 1];
        // const originalFileName = split_data[0];
        // const changeFileName = Buffer.from(split_data[0], 'latin1').toString(
        //   'utf8',
        // );
        // const blockBlobClient =
        //   containerClient.getBlockBlobClient(changeFileName);
        // await blockBlobClient.uploadData(image.buffer);
        // const File = blockBlobClient.url;

        // const size = image.size;

        // //  https://stagebodybuddy.blob.core.windows.net/crawl/HealthFoodData/%EC%98%88%EC%8B%9C)%206%EB%85[…]82%BC%ED%99%A9%EC%A0%9C%EC%A0%95%EC%8A%A4%ED%8B%B1

        // const split_File = File.split('/');
        // const detailPathArray = [];
        // for (let i = 5; i < split_data.length; i++) {
        //   detailPathArray.push(split_data[i]);
        // }

        // const detailPath = `/${detailPathArray.join('/')}`;
        // const commonPath = `/${[split_data[3], split_data[4]].join('/')}`;

        // newDraftImage.File = File;
        // newDraftImage.size = size;
        // newDraftImage.originalFileName = originalFileName;
        // newDraftImage.changeFileName = changeFileName;
        // newDraftImage.extension = extension;
        // newDraftImage.detailPath = detailPath;
        // newDraftImage.commonPath = commonPath;
        // newDraftImage.PRDUCT_ID = id;

        // await this.DraftImageRepository.save(newDraftImage);

        return {
          data: `https://stagebodybuddy.blob.core.windows.net/crawl/HealthFoodData/6%EB%85%84%EA%B7%BC%EB%A9%B4%EC%97%AD%ED%99%8D%EC%82%BC%EC%A0%95%EC%8A%A4%ED%8B%B1`,
        };
      }
    } catch (err) {
      console.log(err.message);
    }
  }

  async putDraft(data, id) {
    try {
      await this.DraftRepository.query(`
      UPDATE DRAFT
      SET text = ${data}
      WHERE id = ${id}`);
    } catch (err) {
      console.log(err.message);
    }
  }
}
