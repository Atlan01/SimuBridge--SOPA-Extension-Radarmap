import { Box, Button, Card, CardBody, CardHeader, Flex, Heading, Spacer, Stack } from "@chakra-ui/react";
import Multibarchart from "./Multibarchart";
import { deleteFile, getFile, getFiles } from "../../util/Storage";
import { useEffect, useState } from "react";
import TabBar from "../TabBar.jsx";
import { axisClasses } from "@mui/x-charts";

const OutputVisualizerPage = ({ projectName, getData, toasting }) => {
  const [reloadFlag, setReloadFlag] = useState(true);
  function reload() {
    setReloadFlag(!reloadFlag);
  }

  const [totalChartData, setTotalChartData] = useState();
  const [activityChartData, setActivityChartData] = useState();
  const normalizationFactor = 1000.0;
  const normalizationString = " x 10^" + -Math.log10(normalizationFactor);
  const valueFormatter = (value) => (
    <span>
      {value.toFixed(2) + " x 10"}
      <sup>{-Math.log10(normalizationFactor)}</sup>
    </span>
  );

  
  const [radarValues1, setRadarValues1] = useState({});
  const [radarValues2, setRadarValues2] = useState({});
  const defaultValue = 70; // Default value for the better value of the radarmap is fixed to 70

  useEffect(() => {
    getFiles(projectName).then(async (fileList) => {
      const statsfiles = fileList.filter((fileName) =>
        fileName.endsWith("statistic.xml")
      );
      console.log(statsfiles);
      const allFileData = await Promise.all(
        statsfiles.map((file) => getFile(projectName, file))
      );

      const parser = new DOMParser();

      const totalChartDataToBe = {
        dataset: [{ data: "" }],
        series: [],
      };
      

      const activityChartDataToBe = {
        dataset: [],
        series: [],
      };

      allFileData.forEach((fileData) => {
        const fileXml = parser.parseFromString(fileData.data, "text/xml");

        const folderName = fileData.path.split("/").slice(3, -1).join("/");
        const resourceUtilsFile = fileList.filter(
          (fileName) =>
            fileName.startsWith(folderName) &&
            fileName.endsWith("resourceutilization.xml")
        )[0];
        const scenarioLabel = resourceUtilsFile
          .split("/")
          .slice(-1)[0]
          .split("_Global_resourceutilization.xml")[0];

        const scenarioKey = "scenario_" + folderName;
        totalChartDataToBe.series.push({
          dataKey: scenarioKey,
          label: scenarioLabel,
          valueFormatter,
        });
        activityChartDataToBe.series.push({
          dataKey: scenarioKey,
          label: scenarioLabel,
          valueFormatter,
        });

        const avgPICost =
          parseFloat(
            fileXml.getElementsByTagName("Average_Process_Instance_Cost")[0]
              .innerHTML
          ) * normalizationFactor;
        totalChartDataToBe.dataset[0][scenarioKey] = avgPICost;

        for (const activity of [
          ...fileXml
            .getElementsByTagName("Activity_Cost")[0]
            .getElementsByTagName("Activity"),
        ]) {
          const activityName = activity
            .getAttribute("id")
            .replaceAll("_", " ")
            .replaceAll(/(\w*?) (\w*?) (\w*?) (\w*?)/g, "$1 $2 $3$4");

          let dataPoint = activityChartDataToBe.dataset.filter(
            (dataPoint) => dataPoint.data == activityName
          )[0];
          if (!dataPoint) {
            dataPoint = { data: activityName };
            activityChartDataToBe.dataset.push(dataPoint);
          }
          dataPoint[scenarioKey] =
            parseFloat(
              activity.getElementsByTagName("Activity_Average_Cost")[0]
                .innerHTML
            ) * normalizationFactor;
        }
      });

      setTotalChartData(totalChartDataToBe);
      setActivityChartData(activityChartDataToBe);
    });
  }, [getData, reloadFlag]);

  function deletePreviousOutputs() {
    getFiles(projectName).then(async (fileList) => {
      const outputFiles = fileList.filter((fileName) =>
        fileName.startsWith("request0")
      );
      outputFiles.forEach((file) => deleteFile(projectName, file));
    });
    reload();
  }

  const totalChartSetting = {
    layout: "vertical",
    yAxis: [
      {
        label: "Average Normalized Environmental Cost per Case" + normalizationString,
      },
    ],
    xAxis: [{ scaleType: "band", dataKey: "data", label: "" }],
  };

  const activityChartSetting = {
    layout: "horizontal",
    sx: {
      [`.${axisClasses.left} .${axisClasses.label}`]: {
        transform: "translate(-200px, 0)",
      },
    },
    yAxis: [
      {
        scaleType: "band",
        dataKey: "data",
        label: "Activity",
        barGapRatio: 0.3,
        categoryGapRatio: 0.4,
      },
    ],
    xAxis: [
      {
        label: "Average Normalized Environmental Cost" + normalizationString,
      },
    ],
  };

  useEffect(() => {

    
    getFiles(projectName).then(async (fileList) => {
      const radarFiles = fileList.filter((fileName) =>
        fileName.endsWith("1_Global_resourceutilization.xml")
      );

      if (radarFiles.length > 0) {
        const radarFile = radarFiles[0];
        const fileData = await getFile(projectName, radarFile);
        const parser = new DOMParser();
        const fileXml = parser.parseFromString(fileData.data, "text/xml");

        const allElements = fileXml.getElementsByTagName("avg");

        const costAverage = allElements[1];
        const costAverageValue = costAverage.textContent || costAverage.innerHTML;
        const timeAverage = allElements[2];
        const timeAverageValue = timeAverage.textContent || timeAverage.innerHTML;

        /* Code for whenever flexibility / quality are calculated -> it is assumed they will be in the same .xml format and file as time and cost
        const qualityAverage = allElements[1];
        const qualityAverageValue = qualityAverage.textContent || qualityAverage.innerHTML;
        const flexibilityAverage = allElements[2];
        const flexibilityAverageValue = flexibilityAverage.textContent || flexibilityAverage.innerHTML;
        */

        const values1 = {
          Quality: 50, // qualityAverageValue
          Flexibility: 50, // flexibilityAverageValue
          Sustainability: 0, // does not matter, will get overwritten anyways
          Cost: 50,//costAverageValue,
          Time: 50,//timeAverageValue,
        };

        setRadarValues1(values1);
      }
    });
  

    getFiles(projectName).then(async (fileList) => {
      const radarFiles = fileList.filter((fileName) =>
        fileName.endsWith("2_Global_resourceutilization.xml")
      );

      if (radarFiles.length > 0) {
        const radarFile = radarFiles[0];
        const fileData = await getFile(projectName, radarFile);
        const parser = new DOMParser();
        const fileXml = parser.parseFromString(fileData.data, "text/xml");

        const allElements = fileXml.getElementsByTagName("avg");

        const costAverage = allElements[1];
        const costAverageValue = costAverage.textContent || costAverage.innerHTML;
        const timeAverage = allElements[2];
        const timeAverageValue = timeAverage.textContent || timeAverage.innerHTML;

        /* Code for whenever flexibility / quality are calculated -> it is assumed they will be in the same .xml format and file as time and cost
        const qualityAverage = allElements[1];
        const qualityAverageValue = qualityAverage.textContent || qualityAverage.innerHTML;
        const flexibilityAverage = allElements[2];
        const flexibilityAverageValue = flexibilityAverage.textContent || flexibilityAverage.innerHTML;
        */

        const values2 = {
          Quality: 50, // qualityAverageValue
          Flexibility: 50, // flexibilityAverageValue
          Sustainability: 0, // does not matter, will get overwritten anyways
          Cost: 50,//costAverageValue,
          Time: 50,//timeAverageValue,
        };

        setRadarValues2(values2);
      }
    });
    
    // Here the sustainability values are updated from the sustainability_global_information_statistic.xml document
    getFiles(projectName).then(async (fileList) => {
        const sustainabilityFiles = fileList.filter((fileName) =>
            fileName.endsWith("1_sustainability_global_information_statistic.xml"));

        const sustainabilityFile = sustainabilityFiles[0];
        const fileData = await getFile(projectName, sustainabilityFile);
        const parser = new DOMParser();
        const fileXml = parser.parseFromString(fileData.data, "text/xml");

        const costElement = fileXml.getElementsByTagName('Average_Process_Instance_Cost');
        const sustainabilityValue = costElement.length > 0
            ? costElement[0].textContent || costElement[0].innerHTML
            : 0;

        setRadarValues1((prevValues) => ({
            ...prevValues,
            Sustainability: 100, // sustainabilityValue (THIS WORKS, my simulation just doesnst produce any value other then 0 right now)
         }))
    });

    // Second sustainability record
    getFiles(projectName).then(async (fileList) => {
        const sustainabilityFiles = fileList.filter((fileName) =>
            fileName.endsWith("1_sustainability_global_information_statistic.xml"));
        
        const sustainabilityFile = sustainabilityFiles[0];
        const fileData = await getFile(projectName, sustainabilityFile);
        const parser = new DOMParser();
        const fileXml = parser.parseFromString(fileData.data, "text/xml");

        const costElement = fileXml.getElementsByTagName('Average_Process_Instance_Cost');
        const sustainabilityValue = costElement.length > 0
            ? costElement[0].textContent || costElement[0].innerHTML
            : 0;

        setRadarValues2((prevValues) => ({
            ...prevValues,
            Sustainability: 120, // sustainabilityValue (THIS WORKS, my simulation just doesnst produce any value other then 0 right now)
        }));
    });
  }, [projectName]);
  
const getRadarmapTabContent = () => {
  const generateModifiedRadarValues = (values1, values2) => {
    const modifiedValues1 = {};
    const modifiedValues2 = {};
    const percentageDifferences = {};
    const defaultValue = 70;

    Object.keys(values1).forEach((key) => {
      const v1 = parseFloat(values1[key]);
      const v2 = parseFloat(values2[key]);
      const maxValue = Math.max(v1, v2);
      const differencePercentage = Math.abs(v1 - v2) / maxValue * 100;

      percentageDifferences[key] = parseFloat(differencePercentage.toFixed(3)); // Store percentage difference

      if (key === "Cost" || key === "Time") {
        if (v1 < v2) {
          modifiedValues1[key] = parseFloat((defaultValue - differencePercentage).toFixed(3));
          modifiedValues2[key] = defaultValue;
        } else if (v1 > v2) {
          modifiedValues1[key] = defaultValue;
          modifiedValues2[key] = parseFloat((defaultValue - differencePercentage).toFixed(3));
        } else {
          modifiedValues1[key] = modifiedValues2[key] = defaultValue;
        }
      } else if (key === "Sustainability" || key === "Flexibility" || key === "Quality") {
        if (v1 > v2) {
          modifiedValues1[key] = parseFloat((defaultValue - differencePercentage).toFixed(3));
          modifiedValues2[key] = defaultValue;
        } else if (v1 < v2) {
          modifiedValues1[key] = defaultValue;
          modifiedValues2[key] = parseFloat((defaultValue - differencePercentage).toFixed(3));
        } else {
          modifiedValues1[key] = modifiedValues2[key] = defaultValue;
        }
      }
    });

    return { modifiedValues1, modifiedValues2, percentageDifferences };
  };

  const { modifiedValues1, modifiedValues2, percentageDifferences } = generateModifiedRadarValues(
    radarValues1,
    radarValues2
  );

  const maxRadius = 100;
  const categories = Object.keys(modifiedValues1);
  const numCategories = categories.length;
  const angleStep = (2 * Math.PI) / numCategories;

  const getRadarPoints = (values) =>
    categories.map((category, index) => {
      const angle = angleStep * index - Math.PI / 2;
      const valueRadius = (values[category] / 100) * maxRadius;
      const x = valueRadius * Math.cos(angle);
      const y = valueRadius * Math.sin(angle);
      return `${x},${y}`;
    });

  const points1 = getRadarPoints(modifiedValues1);
  const points2 = getRadarPoints(modifiedValues2);

  const createGridLines = () =>
    [5, 20, 40, 60, 80, 100].map((radius) => (
      <polygon
        key={radius}
        points={categories
          .map((_, index) => {
            const angle = angleStep * index - Math.PI / 2;
            const x = (radius / 100) * maxRadius * Math.cos(angle);
            const y = (radius / 100) * maxRadius * Math.sin(angle);
            return `${x},${y}`;
          })
          .join(" ")}
        fill="none"
        stroke="#ccc"
        strokeWidth="1"
      />
    ));

  const createLabels = () =>
    categories.map((category, index) => {
      const angle = angleStep * index - Math.PI / 2;
      const labelRadius = maxRadius + 15;
      const x = labelRadius * Math.cos(angle);
      const y = labelRadius * Math.sin(angle);
      return (
        <text
          key={category}
          x={x}
          y={y}
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize="12"
          fontFamily="Arial"
          fill="#333"
        >
          {category}
        </text>
      );
    });

  const createValueTable = () => (
    <table style={{ fontFamily: "Arial", fontSize: "13px", borderCollapse: "collapse", margin: "0 auto" }}>
      <thead>
        <tr>
          <th style={{ padding: "5px", border: "2px solid #ccc" }}>Category</th>
          <th style={{ padding: "5px", border: "2px solid #ccc" }}>Scenario 1</th>
          <th style={{ padding: "5px", border: "2px solid #ccc" }}>Scenario 2</th>
          <th style={{ padding: "5px", border: "2px solid #ccc" }}>Difference (%)</th>
        </tr>
      </thead>
      <tbody>
        {categories.map((category) => (
          <tr key={category}>
            <td style={{ padding: "5px", border: "2px solid #ccc" }}>{category}</td>
            <td style={{ padding: "5px", border: "2px solid #ccc" }}>{modifiedValues1[category]}</td>
            <td style={{ padding: "5px", border: "2px solid #ccc" }}>{modifiedValues2[category]}</td>
            <td style={{ padding: "5px", border: "2px solid #ccc" }}>{percentageDifferences[category]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const createLegend = () => (
    <div style={{ marginTop: "20px", textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: "red",
              marginRight: "5px",
            }}
          ></div>
          <span>Scenario 1</span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: "blue",
              marginRight: "5px",
            }}
          ></div>
          <span>Scenario 2</span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "40px" }}>
      <div style={{ textAlign: "center" }}>
        <div>{createValueTable()}</div>
        <div>{createLegend()}</div>
      </div>
      <svg width="400" height="400" viewBox="-150 -150 300 300">
        {createGridLines()}
        <polygon
          points={points1.join(" ")}
          fill="rgba(255, 0, 0, 0.2)"
          stroke="red"
          strokeWidth="2"
        />
        <polygon
          points={points2.join(" ")}
          fill="rgba(0, 123, 255, 0.2)"
          stroke="blue"
          strokeWidth="2"
        />
        {createLabels()}
      </svg>
    </div>
  );
};


  return (
    <Card>
      <CardHeader>
        <Flex mt={2}>
          <Heading size="md"> Simulation Output Visualizer </Heading>
          <Spacer />
        </Flex>
      </CardHeader>
      <CardBody>
        {activityChartData && totalChartData && (
          <TabBar
            setCurrent={() => {
              reload();
            }}
            items={[
              {
                tabname: "Total Costs",
                content: (
                  <Multibarchart
                    {...{
                      chartData: totalChartData,
                      chartSetting: totalChartSetting,
                    }}
                  />
                ),
              },
              {
                tabname: "Activities",
                content: (
                  <Multibarchart
                    {...{
                      chartData: activityChartData,
                      chartSetting: activityChartSetting,
                    }}
                  />
                ),
              },
              {
                tabname: "Radarmap",
                content: getRadarmapTabContent(),
              },
            ]}
          />
        )}
      </CardBody>
    </Card>
  );
};

export default OutputVisualizerPage;
