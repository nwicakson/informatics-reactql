import React, { Component } from 'react';
import { Select } from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';
import moment from 'moment';
import 'moment/locale/id';
import css from './languageSwitcher.scss';

const { Option } = Select;

export default class LanguageSwitcher extends Component {
  constructor() {
    super();
    this.state = {
      locale: enUS,
    };
  }

  changeLocale = e => {
    const localeValue = e.target.value;
    this.setState({ locale: localeValue });
    moment.locale(e.target.value);
  }

  render() {
    return (
      <div>
        <Select
          defaultValue="en"
          showSearch
          className={css.selectLanguage}
          optionFilterProp="children"
          filterOption={(input, option) => (
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          )}>
          <Option key="en" value="en">English</Option>
          <Option key="id" value="id">Indonesia</Option>
        </Select>
      </div>
    );
  }
}
