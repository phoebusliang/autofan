# autofan

## 简介

关于温湿度传感器和红外传感器的功能和案例,已经有很多repo了。但是这些,我认为只能算是某一个元件的硬件开发。
而真正的智能家居和IoT的基础是`智能设备的自运算`和`人为干预`。这个例子就是基于这两点考虑。另外,对于资源受限
设备(大多数智能硬件)考虑,基于HTTP协议的通信势必会造成很大的负担,所以这里我们采用在IoT领域非常流行的通信协议-MQTT。

1. 获得温度传感器DHT-11的温度值

2. 通过温度值自运算,在某一种边界值的情况下,触发红外发射装置,给空调发送信号

3. 在应用代码中引用`mqtt.js`, 并sub 'topic' 赋给step 2中提到的边界值

4. 在mobile端做一个简单的应用, 通过引用`Moscapsule`(mqtt client swift implementation), publish 'topic',进行人为干预边界值

## 硬件要求

1. [LCD1602 Display Module](https://rap.ruff.io/devices/lcd1602-pcf8574a-hd44780)

2. [Infrared Receive](https://rap.ruff.io/devices/IRR-01)

3. [IR Transmitter](https://rap.ruff.io/devices/IRT-01)

4. [Temperature Humidity Sensor](https://rap.ruff.io/devices/DHT11)

## 软件要求

1.[Ruff SDK](https://ruff.io/zh-cn/docs/download.html)

2.[Ruff 固件](https://ruff.io/zh-cn/docs/download.html)

##Kick off

### 下载安装 Ruff 开发包

你可以到[这里](https://ruff.io/zh-cn/docs/download.html)下载 Ruff 的开发包。

解压缩安装包，假定路径为 your-ruff-directory

添加环境变量，设置 RUFF_HOME 和 PATH 。

如果你使用的是Windows 系统(推荐Win10），可以这样做

    +使用小娜搜索“编辑系统环境变量"，回车

    +点击“环境变量”

    +新建RUFF_HOME环境变量，地址为你解压的ruff sdk的文件夹

    +新建PATH环境变量，地址为解压的ruff sdk的文件夹下的bin文件夹

如果你使用的是 Linux 或 Mac 系统，可以这样做：

    export RUFF_HOME=your-ruff-directory

    export PATH="$PATH:$RUFF_HOME/bin"

在命令行里，键入如下命令

    rap version

如果你能看到 rap 的版本信息，恭喜你，设置成功了！

Ruff 开发包主要提供了如下命令：

+ruff，Ruff 运行时环境，可以执行 JavaScript 程序。

+rap，一个生产力提升工具，提供了从包管理到应用部署等方面的支持。

### 创建项目

在你希望创建项目的目录下，使用 rap 创建项目

    rap init app

根据提示，填写相应内容，一切顺利的话，一个新的目录就创建出来了，我们的项目就在其中，rap 还会为我们下载
开发板的配置信息，并生成缺省的硬件配置信息。
进入到新建的目录中，我们的 Ruff 之旅将正式开始。

### 连接硬件

将 Ruff 开发板接上电源

硬件启动需要一段时间，大约30秒左右，请耐心等待。如果你是第一次使用，则会看到红灯闪烁，它表示等待网络配置中。

配置网络连接，这里采用的是无线网络配置的方式

    rap wifi

填写好 WiFi 的 SSID 和密码，一切顺利的话，我们会看到蓝灯常亮，这表明 Ruff 开发板已经接入到我们的无线网络里。
更多细节，请参考[网络配置](https://ruff.io/zh-cn/docs/network-configuration.html)。

需要注意的是，开发板目前仅支持2.4GHz 的 WiFi 频段，所以请使用2.4GHz 连接。

扫描开发板地址，运行下面的命令

    rap scan

你会看到开发板的地址显示在命令行里，假定为 your_hareware_ip 。

    Scanning (this will take 10 seconds)...
    *[unnamed] - your-hareware-ip

如果有多个设备，选择一个其中一个， rap 会记住这个地址，便于后续操作。根据 rap 的提示，你可以给开发板设置一个 ID ，
做后续的标识。使用下面这个命令，就可以设置开发板的 ID 了。

    rap rename your-hardware-id


### 添加外设
添加外设，运行如下命令：

    rap device add LCD

这里的 LCD 就是我们在应用中用以操作设备的 ID，该命令会提示我们输入设备型号。根据标签上的信息，大按键模块的型号是 LCD1602
然后，rap 会根据外设型号，去寻找相应的驱动。

    ? model: (lcd) lcd1602-pcf8574-hd44780
    ? model: lcd1602-pcf8574-hd44780
    Searching supported drivers from Rap registry...
    ? select a driver for device "lcd"(lcd1602-pcf8574-hd44780): lcd1602-pcf8574-hd44780@0.1.1
    Installing driver...
    Downloading package "lcd1602-pcf8574-hd44780"...
    Extracting package "lcd1602-pcf8574-hd44780" (0.1.1)...
    Downloading package "hd44780"...
    Extracting package "hd44780" (0.1.2)...
    Downloading package "pcf8574"...
    Extracting package "pcf8574" (1.0.2)...
    - lcd1602-pcf8574-hd44780@0.1.1
    - hd44780@0.1.2
    - pcf8574@1.0.2
    Adding device "lcd" to application configuration...
    Done.
    
如上,添加温湿度传感器:

    rap device add dht
    
添加红外发送器:

    rap device add sender
    
添加红外接收器:

    rap device add receiver
    
### 硬件布局

有了外设的相关信息，我们要完成硬件布局以及连接的工作。

硬件布局，运行如下命令：

    rap layout

rap 会给我们自动计算出硬件的布局，也就是连接方式。

我们也可以使用图形化的版本，运行如下命令：

    rap layout --visual

请根据给出的布局方式进行硬件连接。

*注意：请在断掉电源的情况下完成硬件连接，之后，再重新插上电源。*

### 编写代码

+按照 src 目录下的 index.js编写代码

### 日志与部署

为了更好地了解应用的运行状态，我们可以查看日志。

打开另外一个窗口，进入应用所在的目录，启动日志，运行如下命令：

    rap log

接下来，就要部署应用了。如前所示，我们可以用 deploy 和 start 命令将应用运行在开发板上。我们也可以使用一个简化的命令，一次完成这个操作。
部署并启动应用，运行如下命令：

    rap deploy -s
    
    
这样,程序实现为,当室温大于28°,空调打开,当低于28°,空调关闭(当然我们也可以控制更多的条件,或者设计为更加符合实用场景的应用,这里只是简单的例子)

### 在云端启动mqtt server

使用 mosquitto

### buid app

运行app, 输入temp 对边界温度进行干预。 这样空调不单单可以对一个边界温度进行相应,我们也可以在外边利用网络去设置空调的边界温度,让硬件重新进行运算