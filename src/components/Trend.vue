<template>
    <div class="com-container">
        <div class="title" :style="comStyle">
            <span>{{'▎'+showTitle}}</span>
            <span class="iconfont title-icon" :style="comStyle" @click="showChoice = !showChoice ">&#xe6eb;</span>
            <div class="select-con" v-show="showChoice" :style="marginStyle">
                <div class="select-item" v-for="item in selectTypes" :key="item.key" @click="handleSelect(item.key)">
                    {{item.text}}
                </div>
            </div>
        </div>
        <div class="com-chart" ref="trend_ref">
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return{
            chartInstane:null,
            allData:null,  //从服务器中获取的所有数据
            showChoice:false,  //是否显示可选项
            choiceType:'map',   //显示数据的类型
            titleFontSize:0    //指明标题的大小
        }
    },
    mounted(){
        this.initChart()
        this.getData()
        window.addEventListener('resize',this.screenAdapter)
        this.screenAdapter()    //在第一次调用的时候主动触发
    },
    destroyed(){
        window.removeEventListener('resize',this.screenAdapter)
    },
    computed:{
        selectTypes(){
            if(!this.allData){
                return []
            }else{
                // 过滤存在的条目
                return this.allData.type.filter(item=>{    
                    return item.key !== this.choiceType
                })
            }
        },
        showTitle(){
            if(!this.allData){
                return ''
            }else{
                return this.allData[this.choiceType].title
            }
        },
        //设置给标题的样式
        comStyle(){
            return {
                fontSize: this.titleFontSize + 'px',
            }
        },
        marginStyle(){
            return{
                marginLeft:this.titleFontSize +'px'
            }
        }
    },
    methods:{
        initChart(){
            this.chartInstane = this.$echarts.init(this.$refs.trend_ref,'chalk')   //实例对象
            const initOption = {
                grid:{     //移动坐标轴的位置
                    left:'3%',
                    top:'35%',
                    right:'4%',
                    buttom:'1%',
                    containLabel:true  //设置containLabel,使其坐标轴可视
                },
                tooltip:{
                    trigger:'axis'
                },
                legend:{   //设置头上的标题栏
                    left:20,
                    top:'15%',
                    icon:'circle',
                },
                xAxis:{
                    type:'category',
                    boundaryGap:false,   //平移到水平边界
                },
                yAxis:{
                    type:'value'
                }
            }
            this.chartInstane.setOption(initOption)
        },
        async getData(){
            // await this.$http.get()
            const {data:ret}  =  await this.$http.get('trend')
            this.allData = ret
            // 对allData进行赋值
            console.log(this.allData);
            this.updateChart()
        },
        updateChart(){
            const colorArr1 = [
            'rgba(11, 168, 44, 0.5)',
            'rgba(44, 110, 255, 0.5)',
            'rgba(22, 242, 217, 0.5)',
            'rgba(254, 33, 30, 0.5)',
            'rgba(250, 105, 0, 0.5)'
        ]
      // 全透明的颜色值
            const colorArr2 = [
                'rgba(11, 168, 44, 0)',
                'rgba(44, 110, 255, 0)',
                'rgba(22, 242, 217, 0)',
                'rgba(254, 33, 30, 0)',
                'rgba(250, 105, 0, 0)'
            ]
            // 处理数据
            // x轴的数据
            const timeArr = this.allData.common.month
            // y轴的数据
            const valueArr = this.allData[this.choiceType].data
            const seriesArr = valueArr.map((item,index) =>{
                return {
                    name:item.name,
                    type:'line',
                    data:item.data,
                    stack:this.choiceType,
                    areaStyle:{
                        color: new this.$echarts.graphic.LinearGradient(0,0,0,1,[
                            {   
                                offset:0,
                                color:colorArr1[index]
                            },      //%0的颜色值
                            {   
                                offset:1,
                                color:colorArr2[index]
                            }      //100%的颜色值
                        ])  //确定颜色渐变的方向
                    }   
                }
            })
            // 图例数据
            const lengendArr = valueArr.map((item)=>{
                return item.name
            })
            const dataOption = {
                xAxis:{
                    data:timeArr
                },
                legend:{
                    data:lengendArr
                },
                series:seriesArr
            }
            this.chartInstane.setOption(dataOption)
        },
        screenAdapter(){
            this.titleFontSize = this.$refs.trend_ref.offsetWidth / 100 * 3.6    //获得当前的页面的大小
            const adapterOption = {
                legend:{
                    itemWidth:this.titleFontSize,
                    itemHeight:this.titleFontSize,
                    itemGap:this.titleFontSize,
                    textStyle:{
                        fontSize:this.titleFontSize/2
                    }
                }
            }
            this.chartInstane.setOption(adapterOption)
            this.chartInstane.resize()
        },
        handleSelect(currentType){
            this.choiceType = currentType
            this.updateChart()
            this.showChoice = !this.showChoice
        }
    }
}
</script>

<style lang="less" scoped>
.title {
    position:absolute;
    left: 20px;
    top:20px;
    z-index: 10;
    color:white;
    .title-icon{
        margin-left:10px;
        cursor:pointer
    }
    .select-con {
    background-color: #222733;
    }
}
</style>