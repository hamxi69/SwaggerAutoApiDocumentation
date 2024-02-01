
export interface IBaseDao
{
    _id:string;
    CreatedBy: string;
    CreatedOn: Date;
    UpdatedBy: string | null;
    UpdatedOn: Date | null;
    DeletedBy: string | null;
    DeletedOn: Date | null;
    IsDeleted: boolean;
    IsActive:boolean;
}