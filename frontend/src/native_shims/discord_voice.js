import Logger from "common/logger";
import {Buffer} from "node_shims/buffer";
import fs from "node_shims/fs";

let mediaRecorder;
let audioChunks = [];
let mediaStream;

const MIME_TYPE = "audio/webm; codecs=opus";
const TARGET_FILE = "AppData/BetterDiscord/data/recording.webm";

export default {
    startLocalAudioRecording(options, callback) {
        if (typeof(options) === "function") {
            callback = options;
            options = {};
        }

        navigator.mediaDevices.getUserMedia({audio: true})
            .then(stream => {
                // Save the stream to stop it later
                mediaStream = stream;

                // Initialize the MediaRecorder, Chrome does not support audio/ogg!
                mediaRecorder = new MediaRecorder(stream, {mimeType: MIME_TYPE});

                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };

                mediaRecorder.start();

                if (callback) {
                    callback(true);
                }
            })
            .catch(err => {
                Logger.error("discord_voice", "Error during MediaRecorder initialization: ", err);

                if (callback) {
                    callback(false);
                }
            });
    },
    stopLocalAudioRecording(asyncCallback) {
        if (mediaRecorder) {
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, {type: MIME_TYPE});
                const arrayBuffer = await audioBlob.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                fs.writeFileSync(TARGET_FILE, buffer);

                // Cleanup audioChunks to save memory
                audioChunks = [];

                // Stop all tracks to release the microphone
                mediaStream.getTracks().forEach(track => track.stop());

                // Now delete the mediaRecorder
                mediaRecorder = null;

                if (asyncCallback) {
                    asyncCallback(TARGET_FILE);
                }
            };
            mediaRecorder.stop();
        }
    }
};
