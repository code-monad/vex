import { BaseRepository } from "./base";
import {
    GenericTransaction,
    GenericTransactionModel,
} from "../models/transaction";

export class GenericTransactionRepository extends BaseRepository<GenericTransaction> {
    constructor() {
        super(GenericTransactionModel);
    }
}
