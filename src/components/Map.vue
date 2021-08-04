<template>
    <div class="com-container" @click="revertMap">
        <div class="com-chart" ref="map_ref">
        </div>
    </div>
</template>

<script>
import axios from 'axios'
import {getProvinceMapInfo} from '@/utils/map_utils'
export default {
    data(){
        return{
            chartInstance:null,
            allData:null,
            mapData:{}
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
    },
    methods:{
        async initChart(){
            this.chartInstance=this.$echarts.init(this.$refs.map_ref,'chalk')  //在index中引入了js文件
            // 获取中国地图的矢量数据
            // http://localhost:8999/static/map/china.json
            const ret =  await axios.get('http://localhost:8999/static/map/china.json')
            this.$echarts.registerMap('china',ret.data)
            const initOption={
                title:{
                    text:'▎商家分布',
                    left:20,
                    top:50,
                },
                geo:{
                    type:'map',
                    map:'china',
                    top:'5%',
                    button:'5%',
                    itemStyle:{
                        areaColor:'#2E72BF',
                        borderColor:'#333'
                    }
                },
                legend:{
                    left:'5%',
                    bottom:'5%',
                    orient:'vertical',   //设置左下角的标题框垂直
                }
            }
            this.chartInstance.setOption(initOption)
            this.chartInstance.on('click',async arg=>{
                const provinceInfo =  getProvinceMapInfo(arg.name)
                // console.log(provinceInfo);
                if(!this.mapData[provinceInfo.key]){
                    const ret = await axios.get('http://localhost:8999' + provinceInfo.path)
                    // 缓存地图矢量数据
                    this.mapData[provinceInfo.key] = ret.data
                    // console.log(ret);
                    this.$echarts.registerMap(provinceInfo.key,ret.data)
                }
                const changeOption = {
                    geo:{
                        map:provinceInfo.key
                    }
                }
                this.chartInstance.setOption(changeOption)
            })
        },
        async getData(){
            // 获取服务器数据
            const {data:ret} = await this.$http.get('map')
            this.allData = ret
            console.log(ret);
            this.updateChart()
        },
        updateChart(){
            //处理图标所需的数据
            // 图例的数据
            const legendArr = this.allData.map(item=>{
                return item.name
            } )
            const seriesArr = this.allData.map(item=>{
                //这里return的是一个类别下的所有散点数据
                // 如果想要在地图中显示散点的数据,需要给散点的图标增加一个配置,coordinateSystem:geo
                return {
                    type:'effectScatter',
                    rippleEffect:{    //设置涟漪效果
                        scale:5,
                        brushType:'stroke'
                    },
                    name:item.name,
                    data:item.children,
                    coordinateSystem:'geo'
                }
            })
            const dataOption = {
                legend:{
                    data:legendArr
                },
                series:seriesArr
            }
            this.chartInstance.setOption(dataOption)
        },
        screenAdapter(){
            const adapterOption = {}
            this.chartInstance.setOption(adapterOption)
            this.chartInstance.resize() 
        },
        revertMap(){
            const revertOption = {
                geo:{
                    map:'china'
                }
            }
            this.chartInstance.setOption(revertOption)
        }
    },
}
</script>

<style lang="less" scoped>
.com-chart{
    width: 1800px;
    height: 900px;
}
</style>