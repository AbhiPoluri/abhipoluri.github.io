---
author:
  name: "Abhi Poluri"
date: 2021-11-28
linktitle: Control Roku With OpenCV
type:
- post
- posts
title: Control Roku With OpenCV
weight: 10
series:
- Hugo 101
categories:
- Coding
---


## Introduction

I utilised OpenCV in tandem with the Roku python library to control my TV with hand gestures. I first used the mediapipe library to track my hands and using an OpenCV model trained on hand gestures I quickly was able to get the program to pickup on my gestures.

<img src=https://i.imgur.com/pbi9blh.jpg, width=50% height=50%>

Here is a demo of gesture recognition working.
[Demo Here](https://www.youtube.com/watch?v=lUGjyH6fJbE)

I then imported the Roku library and used it to control my TV. Here are the program files and a demo.
{{< github_button button="view" user="AbhiPoluri" repo="OpenCV-roku-remote">}}