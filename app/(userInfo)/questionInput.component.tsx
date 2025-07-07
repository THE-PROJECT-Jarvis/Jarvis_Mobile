import { Control, Controller, FieldValues } from "react-hook-form";
import { Text, TextInput, View } from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
import { Icon } from "react-native-paper";
import { InputType, IQuestion, styles } from "../../lib/userInfo.ias";

const QuestionInput = ({
  question,
  control,
}: {
  question: IQuestion;
  control: Control<FieldValues>;
}) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.labelText}>{question.label}</Text>
      <Controller
        name={question.param}
        control={control}
        render={({ field: { onChange, value } }) =>
          question.input === InputType.Select ? (
            <SelectList
              setSelected={onChange}
              data={question.options}
              search={false}
              boxStyles={styles.input}
              placeholder="Select"
              inputStyles={{ color: "#13b3e9" }}
              dropdownStyles={{
                backgroundColor: "rgba(12, 135, 196, 0.33)",
                borderWidth: 0,
              }}
              arrowicon={<Icon source={"menu-down"} size={24} color="gray" />}
              dropdownTextStyles={{
                color: "#13b3e9",
              }}
              defaultOption={question.options.find(
                (opt) => opt.value === value
              )}
              save="value"
            />
          ) : (
            <TextInput
              value={value}
              onChangeText={onChange}
              keyboardType={
                question.input === InputType.Number ? "numeric" : "default"
              }
              style={styles.input}
              placeholder=" Answer : "
              placeholderTextColor={"#13b3e9"}
            />
          )
        }
      />
    </View>
  );
};

export default QuestionInput;
