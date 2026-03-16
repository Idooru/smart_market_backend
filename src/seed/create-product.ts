import * as axios from "axios";
import dotenv from "dotenv";
import path from "path";
import appRoot from "app-root-path";
import process from "process";
import { products } from "./product";

const dotenvPath = path.resolve(appRoot.path, ".env.dev");
dotenv.config({ path: dotenvPath });

const scheme = `${process.env.APPLICATION_SCHEME}://${process.env.APPLICATION_HOST}:${process.env.APPLICATION_PORT}`;

const requestLoginWithAdmin = async () => {
  const api = "/api/v2/auth/login";
  const url = scheme + api;

  const email = process.env.EMAIL;
  const password = process.env.PASSWORD;
  const credentials = `${email}:${password}`;
  const encoded = Buffer.from(credentials).toString("base64");
  const authHeader = `Basic ${encoded}`;

  try {
    const response = await axios.post(
      url,
      {},
      {
        headers: {
          Authorization: authHeader,
        },
      },
    );

    return response.data["result"];
  } catch (err) {
    console.error(err);
  }
};

const requestCreateProduct = async (token: string) => {
  const api = "/api/v2/admin/product";
  const url = scheme + api;
  const authHeader = `Bearer ${token}`;

  try {
    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      const formData = new FormData();

      // product 객체의 각 필드를 FormData에 추가
      Object.entries(product).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      await axios.post(url, formData, {
        headers: {
          Authorization: authHeader,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(`✅ Created: ${product.name}`);
    }

    console.log(`✅ Success to created all!`);
  } catch (e) {
    console.log(e);
  }
};

const pipe = async () => {
  const token = await requestLoginWithAdmin();
  await requestCreateProduct(token);
};
pipe();
