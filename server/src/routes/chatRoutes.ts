import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getMessages, getChatUsers, uploadFile } from "../controllers/chatController";
import chatUpload from "../middleware/chatUpload";

const router = Router();

router.get("/users", authenticate, getChatUsers);
router.get("/messages/:userId", authenticate, getMessages);
router.post("/upload", authenticate, chatUpload.single("file"), uploadFile);

export default router;
