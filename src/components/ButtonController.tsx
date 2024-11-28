import {useEffect} from 'react';

const ApiUrl = "https://vl.api.jpy.wang/compatible-mode/v1";

interface VideoPreviewProps {
    stream: MediaStream | null;
    elmentId: string;
}

export function ButtonController({stream, elmentId}: VideoPreviewProps) {
    // const videoRef = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        // const videoElement: HTMLElement | null = document.getElementById(elmentId)
    }, [stream, elmentId]);


    const videoElemnet = document.getElementById(elmentId) as HTMLVideoElement;
    let timerHandle: number = 0;


    const cameraBuff: string[] = [];
    let inferenceStatus = false;


    const callApi = function (handle: number) {

        const tips = document.getElementById('tips') as HTMLInputElement;
        const messages = {
            messages: [
                {
                    "role": "user",
                    "content": [] as object[],
                }
            ]
        }

        if (cameraBuff && cameraBuff.length > 0) {
            messages.messages[0].content.push({
                fps: 1.0,
                type: "video",
                video: cameraBuff,
            })
        }
        messages.messages[0].content.push({
            "type": "text",
            "text": tips.value
        })

        window.fetch(
            ApiUrl,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(messages)
            }
        ).then(async res => {
            const data = await res.json();
            const ret = document.getElementById("result") as HTMLTextAreaElement;
            ret.value = JSON.stringify(data);

            // 根据状态继续回调
            if (inferenceStatus && handle == timerHandle) {
                callApi(handle);
            }
        }).catch(err => {
            console.error(err)
        });
    }


    const inference = function () {
        const btnText: HTMLElement = document.getElementById('btnText') as HTMLElement;
        //取反
        inferenceStatus = !inferenceStatus;

        // 开始推理
        if (inferenceStatus) {
            //定时器
            timerHandle = setInterval(() => {
                const canvas = document.createElement('canvas');
                canvas.width = videoElemnet.videoWidth;
                canvas.height = videoElemnet.videoHeight;
                const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
                ctx.drawImage(videoElemnet, 0, 0, canvas.width, canvas.height);
                const dataURL = canvas.toDataURL('image/png');
                // dataURL 有数据才加入数组
                if (dataURL.length <= 'data:,'.length) {
                    return;
                }
                cameraBuff.push(dataURL);
                if (cameraBuff.length > 3) {
                    cameraBuff.shift();
                }
            }, 1000)


            //开始调用api
            callApi(timerHandle);

            btnText.innerText = '停止推理'
        } else {
            //停止调度器
            if (timerHandle && timerHandle != 0) {
                clearInterval(timerHandle);
                timerHandle = 0;
            }
            btnText.innerText = '开始推理'
        }

    }


    return (
        <div className="w-full max-w-md">
            <button
                onClick={() => {
                    inference();
                }}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                <span id="btnText">开始推理</span>
            </button>
        </div>
    );
}