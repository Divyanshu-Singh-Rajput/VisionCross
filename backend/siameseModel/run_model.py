from insightface.app import FaceAnalysis

app = FaceAnalysis(
    name='buffalo_l',
    allowed_modules=['detection', 'recognition'],
    providers=['CUDAExecutionProvider', 'CPUExecutionProvider']
)

app.prepare(ctx_id=0, det_size=(320, 320))

print(f"Models loaded successfully!")
print(f"Detection model : {app.models['detection'].__class__.__name__}")
print(f"Recognition model: {app.models['recognition'].__class__.__name__}")