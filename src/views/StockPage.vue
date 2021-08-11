<template>
<div class="com-container">
    <div class="com-chart" ref='stock_ref'></div>
</div>
</template>

<script>
export default {
    data(){
        return {
            chartInstance:null,
            allData:null,
            currentIndex:0,   //当前显示的数据
            timerId:null     //定时器的标识
        }
    },mounted(){
        this.initChart()
        this.getData()
        window.addEventListener('resize',this.screenAdapter)
        this.screenAdapter()
    },destroyed(){
        window.removeEventListener('resize',this.screenAdapter)
        clearInterval(this.timerId)
    },
    methods:{
        initChart(){
            this.chartInstance = this.$echarts.init(this.$refs.stock_ref,'chalk')
            const initOption = {
                title:{
                    text:'▎库存和销量分析',
                    left:20,
                    top:20,
                }
            }
            this.chartInstance.setOption(initOption)
            this.chartInstance.on('mouseover',()=>{
                clearInterval(this.timerId)
            })
            this.chartInstance.on('mouseout',()=>{
                this.startInterval()
            })
        },
        async getData(){
            // 获取服务器需要的数据
            const {data:ret} = await this.$http.get('stock')
            this.allData = ret
            console.log(this.allData);
            this.updateChart()
            this.startInterval()
        },
        updateChart(){
            // 获取圆环的坐标
            const centerArr = [
                ['18%','40%'],
                ['50%','40%'],
                ['82%','40%'],
                ['34%','75%'],
                ['66%','75%']
            ]
            const colorArr = [
                ['#4FF778', '#0BA82C'],
                ['#E5DD45', '#E8B11C'],
                ['#E8821C', '#E55445'],
                ['#5052EE', '#AB6EE5'],
                ['#23E5E5', '#2E72BF']
            ]
            // 处理图表所需要的数据
            const start =this.currentIndex*5
            const end = (this.currentIndex+1)*5
            const showData = this.allData.slice(start,end)
            const seriesArr = showData.map((item,index) =>{
                return {
                    type: 'pie',
                    radius:[110,100],
                    center:centerArr[index],    //获取中心点的坐标
                    hoverAnimation:false,       //关闭鼠标移入饼图时的效果
                    labelLine:{
                        show:false               //隐藏指示线
                    },
                    label:{
                        position:'center',
                        color:colorArr[index][0]
                    },
                    data:[
                        {
                            name:item.name+'\n'+item.sales,
                            value:item.sales,
                            itemStyle:{
                                color:new this.$echarts.graphic.LinearGradient(0,1,0,0,[
                                    {
                                        offset: 0,
                                        color:colorArr[index][0]
                                    },
                                    {
                                        offset:1,
                                        color:colorArr[index][1]
                                    }
                                ])
                            }
                        },
                        {
                            value:item.stock,
                            itemStyle:{
                                color:'#333843'
                            }
                        }
                    ]
                }
            })
            const dataOption = {
                series:seriesArr
            }
            this.chartInstance.setOption(dataOption)
        },
        screenAdapter(){
            const adapterOption = {}
            this.chartInstance.setOption(adapterOption)
            this.chartInstance.resize()
        },
        startInterval(){
            if(this.timerId){
                clearInterval(this.timerId)
            }
            this.timerId =  setInterval(()=>{
                this.currentIndex++
                if(this.currentIndex >1){
                    this.currentIndex =0
                }
                this.updateChart()       //在更改完currentIndex之后,需要更新界面
            },5000)
        }
    }
}
</script>

<style lang="less" scoped>

</style>