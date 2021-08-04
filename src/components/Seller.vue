// 商家销量统计的横向柱状图
<template>
  <div class="com-container">
    <div class="com-chart" ref="seller_ref">
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      chartInstance:null,
      allData:null,   //服务器返回的数据
      currentPage:1,  //当前显示的页数
      totalPage:0,     //一共有多少页
      timerId:null    //定时器的标识 
    }
  },
  destroyed(){
    clearInterval(this.timerId)
    // 取消监听.防止内存泄漏
    window.removeEventListener('resize',this.screenAdapter)
  },
  mounted(){
    this.initChart()
    this.getData()
    window.addEventListener('resize',this.screenAdapter)
    // 页面加载完成,主动对屏幕进行适配
    this.screenAdapter()
  },
  methods:{
    //初始化echarts的实例对象
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.seller_ref,'chalk')
      // 对图表的初始化配置的控制
      const initOption = {
        title:{
          text:'▎商家销售统计',
          textStyle:{
          },
          left:20,
          top:20
        },
        grid:{
          top: '20%',
          left:'3%',
          right:'6%',
          bottom:'3%',
          containLabel:true   //距离包含坐标轴的位置
        },
        xAxis:{
          type:'value'
        },
        yAxis:{
          type:'category',
        },
        tooltip:{         //使用tooltip工具来进行实现
          trigger:'axis',    //设置背景,当鼠标移动到..上触发
          axisPointer:{
            type:'line',
            z:0,
            lineStyle:{
              color:'#2D3443'
            }
          }
        },
        series:[
          {
            type:'bar',
            label:{
              show:true,
              position:'right',
              textStyle:{
                color:'white'
              }
            },
            itemStyle:{
              // 指明颜色渐变的方向
              // 指明不同百分比下颜色的值
              // color:new this.$echarts.graphic.LinearGradient(x1,y1,x2,y2)
              color:new this.$echarts.graphic.LinearGradient(0,0,1,0,[
                // 百分之0下的颜色值
                {
                  offset:0,
                  color:'#5052EE'
                },
                {
                  offset:1,
                  color:'#AB6EE5'
                }
              ])
            }
          }
        ]
      }
      this.chartInstance.setOption(initOption)
      //需要对图标对象进行鼠标事件的监听
      this.chartInstance.on('mouseover',()=>{    //鼠标移出清除定时器
        clearInterval(this.timerId)
      })
      this.chartInstance.on('mouseout',()=>{    //鼠标移入添加定时器
        this.startInterval()                
      })
    },
    //获取服务器的数据
    async getData(){
      //访问http://
      const {data:ret} = await this.$http.get('seller')
      // console.log(ret);
      this.allData = ret
      this.allData.sort((a,b)=>{
        return a.value - b.value  //从小到大进行排序
      })
      this.totalPage = this.allData.length%5==0 ? this.allData.length/5 : this.allData.length/5+1
      this.updateChart()
      //启动定时器
      this.startInterval()
    },
    //更新图标
    updateChart(){
      const start = (this.currentPage - 1)*5
      const end = this.currentPage * 5
      const showData = this.allData.slice(start,end)
      const sellerNames = showData.map((item)=>{
        return item.name
      })
      const sellerValues = showData.map((item)=>{
        return item.value
      })
      const dataOption ={
        yAxis:{
          data:sellerNames
        },
        series:[
          {
            data:sellerValues,
          }
        ]
      }
      this.chartInstance.setOption(dataOption)
    },
    startInterval(){
      if(this.timerId){
        clearInterval(this.timerId)
      } //在开始定时器前先判断定时器是否存在
      this.timerId =  setInterval(()=>{
        this.currentPage++
        if(this.currentPage>this.totalPage){
          this.currentPage=1
        }
        this.updateChart()
      },3000)
    },
    //当浏览器大小发生变化的适配
    screenAdapter(){
      //获得浏览器容器的大小 
      const tittleFontSize = this.$refs.seller_ref.offsetWidth/100*3.6  //适合界面展示的大小
      // 和分辨率大小的配置
      const adapterOption = {
        title:{
          textStyle:{
            fontSize:tittleFontSize,
          },
        },
        tooltip:{         //使用tooltip工具来进行实现
          axisPointer:{
            lineStyle:{
              width:tittleFontSize,
            }
          }
        },
        series:[
          {
            barWidth:tittleFontSize,
            itemStyle:{
              barBorderRadius:[0,tittleFontSize/2,tittleFontSize/2,0],    //设置柱状图的圆角效果
            }
          }
        ]
      }   
      this.chartInstance.setOption(adapterOption)
      //手动调用图标的resize方法
      this.chartInstance.resize()
    } 
  }
}
</script>

<style>

</style>