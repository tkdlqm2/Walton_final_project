import axios from 'axios'
import { API } from '../../util/constant/constant';
import io from 'socket.io-client';

const PATH = API.importer;
const service = {
    /**
     * 수입 업자 - 원두 등록
     * 
     * @author Dong-Min Seol
     * @since  2019.09.22
     */

    registerGood: (data) => {
        return axios.post(`${PATH}/enrollGoods_improter`, data)
            .then(res => {

                return res.status == 200 ? true : false;
            })
    },

    /**
     * 수입 업자 - 상품 출고
     * 
     * @author Dong-Min Seol
     * @since  2019.09.22
     */

    releaseGood: (data) => {
        return axios.post(`${PATH}/sendGoods_importer`, data)
            .then(res => {
                return res.status == 200 ? true : false;
            })
    }
}

export default service;