<template>
    <div class="com-container">
        <div class="com-chart" ref="rank_ref">
        </div>
    </div>
</template>

<script>
export default {
    data(){
        return{
            chartInstane :null,
            allData:null,
            startValue:0,  //区域缩放的起点值
            endValue:9,     //区域缩放的终点值
            timeId:null    //定时器的标识 
        }
    },
    mounted(){
        this.initChart()
        this.getData()
        window.addEventListener('resize',this.screenAdapter)
        this.screenAdapter()
    },
    destroyed(){
        window.removeEventListener('resize',this.screenAdapter)
        clearInterval(this.timeId)
    },
    methods:{
        initChart(){
            this.chartInstane = this.$echarts.init(this.$refs.rank_ref,'chalk')
            const initOption = {
                title:{
                    text:'▎地区销售排行',
                    left:20,
                    top:20
                }, 
                grid:{
                    top:'40%',
                    left:'5%',
                    right:'5%',
                    bottom:'5%',
                    containable:true
                }, 
                tooltip:{
                    show:true
                } ,
                xAxis:{
                    type:'category'
                },
                yAxis:{
                    type:'value'
                },
                series:[
                    {
                        type:'bar'
                    }
                ],
                
            }
            this.chartInstane.setOption(initOption)
            this.chartInstane.on('mouseover',()=>{
                clearInterval(this.timeId)
            })
            this.chartInstane.on('mouseout',()=>{
                this.startInterval()
            })
        },
        async getData(){
            // 获取服务器的数据
            const {data:ret} = await this.$http.get('rank')
            this.allData = ret
            // 对allData里面的每个元素进行排序,从大到小进行
            this.allData.sort((a,b)=>{
                return b.value- a.value
            })
            console.log(ret);
            this.updateChart()
            this.startInterval()
        },
        updateChart(){
            const colorArr = [
                ['#0BA82C', '#4FF778'],
                ['#2E72BF', '#23E5E5'],
                ['#5052EE', '#AB6EE5']
            ]
            // 处理图表需要的数据
            const provinceArr = this.allData.map(item=>{
                return item.name
            })
            console.log(provinceArr)
            const valueArr = this.allData.map(item=>{
                return item.value
            })
            const dataOption = {
                xAxis:{
                    data:provinceArr
                },
                dataZoom:{
                    show:false,
                    startValue:this.startValue,
                    endValue:this.endValue
                },
                series:[
                    {
                        data:valueArr,
                        itemStyle:{
                            color:arg=>{
                                let targetColorArr = null
                                if(arg.value > 300){
                                    targetColorArr = colorArr[0]
                                }else if(arg.value>200){
                                    targetColorArr = colorArr[1]
                                }else{
                                    targetColorArr = colorArr[2]
                                }
                                return new this.$echarts.graphic.LinearGradient(0,0,0,1,[
                                    {
                                        offset:0,
                                        color:targetColorArr[0]
                                    },
                                    {
                                        offset:1,
                                        color:targetColorArr[1]
                                    }
                                ])
                            }
                        }
                    }                
                ]
            }
            this.chartInstane.setOption(dataOption)
        },
        screenAdapter(){
            const titleFontSize = this.$refs.rank_ref.offsetWidth /100*3.6
            const adapterOption = {
                title:{
                    textStyle:{
                        fontSize:titleFontSize
                    }
                },
                series:[
                    {
                        barWidth:titleFontSize,
                        itemStyle:{
                            barBorderRadius:[titleFontSize/2,titleFontSize/2,0,0]
                        }
                    }
                ]
            }
            this.chartInstane.setOption(adapterOption)
            this.chartInstane.resize()
        },
        startInterval(){
            if(this.timeId){
                clearInterval(this.timeId)
            }
             this.timeId = setInterval(()=>{
               this.startValue++
                this.endValue++
                if(this.endValue > this.allData.lenght - 1){
                    this.startValue = 0
                    this.endValue = 9
                }
                this.updateChart()
            },2000)
        }
    }
}
</script>

<style lang="less" scoped>

</style>