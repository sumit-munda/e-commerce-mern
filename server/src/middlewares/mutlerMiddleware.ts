import multer from "multer";
// import { v4 as uuid } from "uuid";

// const storage = multer.diskStorage({
//   destination(req, file, callback) {
//     callback(null, "uploads");
//   },
//   filename(req, file, callback) {
//     const id = uuid();
//     const extName = file.originalname.split(".").pop();
//     const fileName = `${id}.${extName}`;
//     callback(null, fileName);
//   },
// });

// * access via req.file.photo
// * when using disk storage
// export const singleUpload = multer({ storage }).single("photo");

// * when using ram
export const 
singleUpload = multer().single("photo");
export const multiUpload = multer().array("photos", 5);
