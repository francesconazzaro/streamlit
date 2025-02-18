/**
 * @license
 * Copyright 2018-2021 Streamlit Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { CancelToken } from "axios"
import HttpClient from "src/lib/HttpClient"
import { SessionInfo } from "src/lib/SessionInfo"

/**
 * Handles uploading files to the server.
 */
export class FileUploadClient extends HttpClient {
  /**
   * Upload a file to the server. It will be associated with this browser's sessionID.
   *
   * @param widgetId: the ID of the FileUploader widget that's doing the upload.
   * @param file: the files to upload.
   * @param onUploadProgress: an optional function that will be called repeatedly with progress events during the upload.
   * @param cancelToken: an optional axios CancelToken that can be used to cancel the in-progress upload.
   *
   * @return a Promise<number> that resolves with the file's unique ID, as assigned by the server.
   */
  public async uploadFile(
    widgetId: string,
    file: File,
    onUploadProgress?: (progressEvent: any) => void,
    cancelToken?: CancelToken
  ): Promise<number> {
    const form = new FormData()
    form.append("sessionId", SessionInfo.current.sessionId)
    form.append("widgetId", widgetId)
    form.append(file.name, file)

    return this.request<number>("upload_file", {
      cancelToken,
      method: "POST",
      data: form,
      responseType: "text",
      onUploadProgress,
    }).then(rsp => {
      // Sanity check. Axios should be returning a number here.
      if (typeof rsp.data === "number") {
        return rsp.data
      }

      throw new Error(
        `Bad uploadFile response: expected a number but got '${rsp.data}'`
      )
    })
  }
}
