import cv2
import os
import random
import glob
import numpy as np

# Import PyTorch dependencies
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset
import torchvision.transforms as transforms

def generate_triplets(i_dir='i', v_dir='v', num_triplets_per_anchor=5):
    """Generate triplets with multiple pos/neg pairs per anchor for better diversity."""
    triplets = []
    if os.path.exists(i_dir) and os.path.exists(v_dir):
        for i_folder in os.listdir(i_dir):
            base_id = i_folder
            anchor_imgs = glob.glob(os.path.join(i_dir, i_folder, '*.*'))
            
            pos_folders = [f for f in os.listdir(v_dir) if f.startswith(base_id + '-')]
            pos_imgs = []
            for f in pos_folders:
                pos_imgs.extend(glob.glob(os.path.join(v_dir, f, '*.*')))
                
            neg_folders = [f for f in os.listdir(v_dir) if not f.startswith(base_id + '-')]
            neg_imgs = []
            for f in neg_folders:
                neg_imgs.extend(glob.glob(os.path.join(v_dir, f, '*.*')))
                
            for anc in anchor_imgs:
                if pos_imgs and neg_imgs:
                    for _ in range(min(num_triplets_per_anchor, len(pos_imgs))):
                        pos = random.choice(pos_imgs)
                        neg = random.choice(neg_imgs)
                        triplets.append((anc, pos, neg))
    else:
        print('Directories i and v not found.')
    return triplets

test_transform = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize((112, 112)), # Just resize, no random cropping
    transforms.ToTensor()
])

def preprocess(file, transform=None):
    byte_img =     img = cv2.imdecode(
        np.frombuffer(file.read(), np.uint8),
        cv2.IMREAD_COLOR
    )
    img = cv2.cvtColor(byte_img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (112, 112))
    if transform:
        img = transform(img)
    return img

class TripletDataset(Dataset):
    def __init__(self, data, transform=None):
        self.data = data
        self.transform = transform

    def __len__(self):
        return len(self.data)

    def __getitem__(self, index):
        anc_path, pos_path, neg_path = self.data[index]

        return (
            preprocess(anc_path, self.transform),
            preprocess(pos_path, self.transform),
            preprocess(neg_path, self.transform)
        )

class Embedding(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(3, 64, kernel_size=10)
        self.bn1 = nn.BatchNorm2d(64)
        self.pool1 = nn.MaxPool2d(2, 2)
        self.conv2 = nn.Conv2d(64, 128, kernel_size=7)
        self.bn2 = nn.BatchNorm2d(128)
        self.pool2 = nn.MaxPool2d(2, 2)
        self.conv3 = nn.Conv2d(128, 128, kernel_size=4)
        self.bn3 = nn.BatchNorm2d(128)
        self.pool3 = nn.MaxPool2d(2, 2)
        self.conv4 = nn.Conv2d(128, 256, kernel_size=4)
        self.bn4 = nn.BatchNorm2d(256)
        self.flatten = nn.Flatten()
        self.dropout = nn.Dropout(0.5)
        self.fc1 = nn.Linear(256 * 6 * 6, 512)

    def forward(self, x):
        x = self.pool1(F.relu(self.bn1(self.conv1(x))))
        x = self.pool2(F.relu(self.bn2(self.conv2(x))))
        x = self.pool3(F.relu(self.bn3(self.conv3(x))))
        x = F.relu(self.bn4(self.conv4(x)))
        x = self.flatten(x)
        x = self.dropout(x)
        x = self.fc1(x)
        x = F.normalize(x, p=2, dim=1)
        return x

class SiameseNetwork(nn.Module):
    def __init__(self):
        super().__init__()
        self.embedding = Embedding()

    def forward(self, x1, x2=None, x3=None):
        if x2 is None and x3 is None:
            return self.embedding(x1)
        return self.embedding(x1), self.embedding(x2), self.embedding(x3)

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

model=SiameseNetwork().to(device)
model.load_state_dict(torch.load(os.path.join("siameseModel", "siamese_modelv-3.pth"), map_location=device))