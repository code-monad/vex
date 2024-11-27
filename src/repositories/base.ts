import { Model, Document, FilterQuery, UpdateQuery } from "mongoose";
import logger from "../utils/logger";

export abstract class BaseRepository<T extends Document> {
    constructor(protected model: Model<T>) {}

    async create(data: Partial<T>): Promise<T> {
        try {
            const document = new this.model(data);
            return await document.save();
        } catch (error) {
            logger.error(`Error creating document: ${error}`);
            throw error;
        }
    }

    async findOne(filter: FilterQuery<T>): Promise<T | null> {
        try {
            return await this.model.findOne(filter).exec();
        } catch (error) {
            logger.error(`Error finding document: ${error}`);
            throw error;
        }
    }

    async updateOne(
        filter: FilterQuery<T>,
        update: UpdateQuery<T>,
    ): Promise<T | null> {
        try {
            return await this.model
                .findOneAndUpdate(filter, update, { new: true })
                .exec();
        } catch (error) {
            logger.error(`Error updating document: ${error}`);
            throw error;
        }
    }

    async upsert(
        filter: FilterQuery<T>,
        update: UpdateQuery<T>,
    ): Promise<T | null> {
        try {
            const options = { new: true, upsert: true };
            return await this.model
                .findOneAndUpdate(filter, update, options)
                .exec();
        } catch (error) {
            logger.error(`Error upserting document: ${error}`);
            throw error;
        }
    }

    async find(filter: FilterQuery<T>): Promise<T[]> {
        try {
            return await this.model.find(filter).exec();
        } catch (error) {
            logger.error(`Error finding documents: ${error}`);
            throw error;
        }
    }

    async delete(filter: FilterQuery<T>): Promise<boolean> {
        try {
            const result = await this.model.deleteOne(filter).exec();
            return result.deletedCount > 0;
        } catch (error) {
            logger.error(`Error deleting document: ${error}`);
            throw error;
        }
    }
}
