export interface InquiryMediaHeaderKey {
  request: {
    imageUrlHeader: string;
    videoUrlHeader: string;
  };
  response: {
    imageUrlHeader: string;
    videoUrlHeader: string;
  };
}

export const inquiryMediaHeaderKey: InquiryMediaHeaderKey = {
  request: {
    imageUrlHeader: "inquiry_request_image_url_header",
    videoUrlHeader: "inquiry_request_video_url_header",
  },
  response: {
    imageUrlHeader: "inquiry_response_image_url_header",
    videoUrlHeader: "inquiry_response_video_url_header",
  },
};
