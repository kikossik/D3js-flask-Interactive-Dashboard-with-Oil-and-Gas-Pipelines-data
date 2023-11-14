from flask import Flask, render_template
import pandas as pd
import numpy as np
import json


app = Flask(__name__)


map_df = pd.read_csv("static/data/df_for_map.csv")
bar_df = pd.read_csv("static/data/df_for_bar_chart.csv")


@app.route("/")
def index():
    return render_template("index.html")

def convert_to_json(df):
    json_lst = []
    for i in (range(len(df))):
        d = json.loads(df.iloc[i, :].to_json())
        json_lst.append(d)
    return json_lst

def subset_data_on_causesOfFail(cause):
    new_df = bar_df.pivot_table(values=cause,index='IDATE',columns='CAUSE', aggfunc=np.sum)
    new_df = new_df.rename_axis(None)
    new_df = new_df.fillna(0)
    new_df = new_df.reset_index()
    new_df.rename(columns={"index": "YEAR",
            "CORROSION":"A","EQUIPMENT FAILURE":"B",
            "EXCAVATION DAMAGE":"C","INCORRECT OPERATION BY OPERATOR PERSONNEL":"D",
            "MATERIAL FAILURE OF PIPE OR WELD":"E",
            "NATURAL FORCE DAMAGE":"F","OTHER OUTSIDE FORCE DAMAGE":"G",
            "OTHER":"H"}, inplace=True)
    if cause == "TFAT" or cause == "TINJ":
        return new_df
    else:
        return convert_to_json(new_df)

@app.route("/get_map_data")
def get_map_data():
    # json files for each year
    df = [x for _, x in map_df.groupby('YEAR')]
    df1, df2, df3, df4, df5, df6, df7, df8, df9, df10, df11, df12, df13, df14, df15, df16, df17, df18, df19, df20, df21, df22, df23, df24, df25, df26, df27, df28, df29, df30, df31, df32, df33, df34, df35, df36 = df
    df1, df2, df3, df4, df5, df6, df7, df8, df9, df10, df11, df12, df13, df14, df15, df16, df17, df18, df19, df20, df21, df22, df23, df24, df25, df26, df27, df28, df29, df30, df31, df32, df33, df34, df35, df36 = list(map(lambda x: convert_to_json(x), [df1, df2, df3, df4, df5, df6, df7, df8, df9, df10, df11, df12, df13, df14, df15, df16, df17, df18, df19, df20, df21, df22, df23, df24, df25, df26, df27, df28, df29, df30, df31, df32, df33, df34, df35, df36]))

    return_df = [df1, df2, df3, df4, df5, df6, df7, df8, df9, df10, df11, df12, df13, df14, df15, df16, df17, df18, df19, df20, df21, df22, df23, df24, df25, df26, df27, df28, df29, df30, df31, df32, df33, df34, df35, df36]

    return return_df

@app.route('/get_bar_chart_data')
def get_bar_chart_data():
    full_return = []
    # subseting data + converting to json
    tot_cost = subset_data_on_causesOfFail("TOTAL_COST_CURRENT")
    tfat = subset_data_on_causesOfFail("TFAT")
    tinj = subset_data_on_causesOfFail("TINJ")
    loss = subset_data_on_causesOfFail("LOSS")
    recov = subset_data_on_causesOfFail("RECOV")

    df_tfat_tinj = tfat.add(tinj, fill_value=0)
    df_tfat_tinj = convert_to_json(df_tfat_tinj)

    full_return = [tot_cost, df_tfat_tinj, loss, recov]
    return full_return



if __name__ == '__main__':
    app.run(debug=True)