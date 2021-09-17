const img = document.createElement('img');
const video = document.createElement('video');
const canvas = document.createElement('canvas');

// [img, video, canvas].forEach((e) => e.style.display = 'none');
navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  video.srcObject = stream;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  // Other browsers will fall back to image/png
  //   img.src = canvas.toDataURL("image/webp");
  // window.open(canvas.toDataURL("image/webp"), '__blank');
  stream.getTracks().forEach(function (track) {
    track.stop();
  });
});
