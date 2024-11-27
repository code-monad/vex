import { Transaction } from "../types/transaction";
import { BaseRepository } from "../repositories/base";
import { Document, FilterQuery, UpdateQuery } from "mongoose";

export abstract class BaseProcessor {
    constructor(
        protected name: string,
        protected repositories: Record<string, BaseRepository<any>> = {},
    ) {}

    public getName(): string {
        return this.name;
    }

    protected async saveToDb<T extends Document>(
        repositoryName: string,
        filter: FilterQuery<T>,
        data: UpdateQuery<T>,
    ): Promise<T | null> {
        const repository = this.repositories[repositoryName];
        if (!repository) {
            throw new Error(`Repository ${repositoryName} not found`);
        }
        return await repository.upsert(filter, data);
    }

    protected async findInDb<T extends Document>(
        repositoryName: string,
        filter: FilterQuery<T>,
    ): Promise<T | null> {
        const repository = this.repositories[repositoryName];
        if (!repository) {
            throw new Error(`Repository ${repositoryName} not found`);
        }
        return await repository.findOne(filter);
    }

    abstract process(tx: Transaction): Promise<void>;
}
