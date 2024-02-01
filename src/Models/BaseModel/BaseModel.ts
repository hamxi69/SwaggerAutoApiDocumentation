import { Schema } from "mongoose";
import { Guid } from "guid-typescript";
import moment from "moment";

const baseSchema = new Schema({
    _id: {
        type: String,
        default: () => Guid.create().toString(),
        required: true,
    },
    CreatedOn: {
        type: Date,
        default: () => moment().toDate(),
    },
    CreatedBy: {
        type: String,
        default: 'System',
        required: true,
        ref: 'User',
    },
    UpdatedOn: {
        type: Date,
    },
    UpdatedBy: {
        type: String,
        ref: 'User',
    },
    DeletedOn: {
        type: Date,
    },
    DeletedBy: {
        type: String,
        ref: 'User',
    },
    IsDeleted: {
        type: Boolean,
        default: false,
    },
    IsActive: {
        type: Boolean,
        default: true,
    },
});

const BaseModelEntity = baseSchema;
export {BaseModelEntity};
