import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ViewStyle,
  StyleProp,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  SafeAreaView,
  Platform,
  TextStyle
} from 'react-native';
import { AntDesign, EvilIcons } from 'react-native-vector-icons';
var currentDropDownId = "";
const DropDownContext = React.createContext(
  {} as {
    show: (item: React.ReactNode, id: string) => void;
    clear: (id: string) => void;
    component: { id: string; event: (v: boolean) => void }[];
    registerComponent: (id: string, value: (v: boolean) => void) => void;
    unregisterComponent: (id: string) => void;
  }
);
export const DropDownProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentValue, setCurrentValue] = useState(
    undefined as React.ReactNode | undefined
  );

  const [appcontextValue] = useState({
    show: (value: React.ReactNode, id: string) => {
      currentDropDownId = id;
      appcontextValue.clear("");
      setCurrentValue(
        <>
          <TouchableOpacity
            activeOpacity={0.1}
            style={{
              zIndex: 188,
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
            onPress={() => appcontextValue.clear(id)}
          />
          {value}
        </>
      );
    },
    clear: (id) => {
      if (currentDropDownId == id) {
        setCurrentValue(undefined);
        currentDropDownId = "";
      }
      appcontextValue.component.forEach((x) => {
        if (x.id != currentDropDownId)
          x.event(false)
      });
    },
    component: [] as { id: string; event: (v: boolean) => void }[],
    registerComponent: (id: string, component: (v: boolean) => void) => {
      appcontextValue.component.push({ id: id, event: component });
    },
    unregisterComponent: (id: string) => {
      appcontextValue.component = appcontextValue.component.filter(x => x.id != id);
      if (currentDropDownId === id) {
        currentDropDownId = ""
        setCurrentValue(undefined);
      }
    },
  });

  return (
    <DropDownContext.Provider value={appcontextValue}>
      {children}
      <>{currentValue ? currentValue : null}</>
    </DropDownContext.Provider>
  );
};

export interface DropDownItem {
  label: string;
  value: any;
  icon: () => React.ReactNode;
}

var timeout = undefined;
export const DropDownList = ({
  items,
  selectedValue,
  placeHolder,
  onSelect,
  style,
  dropDownListStyle,
  dropDownItemStyle,
  dropDownItemSelectedStyle,
  dropDownListTextStyle,
  dropDownListSelectedTextStyle,
  includeIconOnTextInput,
  searchAble,
  searchPlaceHolder,
}: {
  items: DropDownItem[];
  selectedValue: any;
  placeHolder?: string;
  onSelect?: (selectedItem: DropDownItem) => void;
  style?: StyleProp<ViewStyle>;
  dropDownListStyle?: StyleProp<ViewStyle>;
  dropDownItemStyle?: StyleProp<ViewStyle>;
  dropDownItemSelectedStyle?: StyleProp<ViewStyle>;
  dropDownListTextStyle?: StyleProp<TextStyle>;
  dropDownListSelectedTextStyle?: StyleProp<TextStyle>;
  includeIconOnTextInput?: boolean;
  searchAble?: boolean;
  searchPlaceHolder?: string;
}) => {
  const dropDownContext = useContext(DropDownContext);
  const [visible, setVisible] = useState(false as Boolean);
  const [id, setId] = useState(new Date().getUTCMilliseconds().toString());
  const [refs] = useState(React.createRef<TouchableOpacity>());
  const [position, setPosition] = useState(
    {} as { top: number; left: number; height: number; width: number }
  );
  const [data, setData] = useState(items);

  const search = (text: string) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      setData(
        text == ''
          ? items
          : items.filter(
            (x) =>
              x.label
                .toLocaleLowerCase()
                .indexOf(text.trim().toLocaleLowerCase()) != -1
          )
      );
      show(); // update
    }, 300);
  };

  const validatePosition = () => {
    if (refs.current) {
      refs.current.measure(async (fx, fy, width, height, px, py) => {
        await setPosition({
          top: py,
          left: px,
          height: height,
          width: width,
        });
      });
    }
  };

  const isWeb = () => {
    if (Platform.OS === 'ios') {
      return false;
    } else if (Platform.OS === 'android') {
      return false;
    } else if (Platform.OS === 'web') {
      return true;
    } else {
      return false;
    }
  }

  useEffect(() => {
    if (visible) show();
  }, [data, position]);

  useEffect(() => {
    setData(items);
  }, [visible]);


  const show = () => {
    var dimHeight = Dimensions.get('window').height;
    var height = styles.list.minHeight;

    dropDownContext.show(
      <SafeAreaView
        style={[
          dropDownListStyle,
          styles.list,
          {
            top: height + position.top + position.height > dimHeight ? position.top - height : position.height + position.top,
            left: position.left,
            minWidth: position.width,
            height: height,
            paddingBottom: 5,
            overflow: 'hidden',
            maxWidth: "98%"
          },
        ]}>
        {searchAble && (isWeb() || height + position.top + position.height <= dimHeight) ? (
          <View style={styles.searchBarContainer}>
            <EvilIcons name={'search'} size={20} />
            <TextInput
              onChangeText={search}
              onFocus={validatePosition}
              placeholder={searchPlaceHolder}
              style={styles.searchBar}
            />
          </View>
        ) : null}

        <SafeAreaView
          style={{ maxHeight: '80%', flex: 1, overflow: 'hidden' }}>
          <ScrollView
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ marginBottom: 4 }}>
            {data.map((x, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dropDownItem,
                  {
                    width: '100%',
                    paddingLeft: 5,
                    backgroundColor: x.value === selectedValue ? '#ff6358' : undefined,
                  },
                  dropDownItemStyle,
                  x.value === selectedValue ? dropDownItemSelectedStyle : {},
                ]}
                onPress={() => {
                  onSelect ? onSelect(x) : null;
                  dropDownContext.clear(id);
                }}>
                {x.icon ? x.icon() : null}
                <Text
                  style={[
                    {
                      width: '100%',
                      paddingLeft: 5,
                      backgroundColor: undefined,
                      color: x.value === selectedValue ? '#fff' : dropDownListTextStyle?.color ?? 'black',
                    },
                    dropDownListTextStyle,
                    x.value === selectedValue ? dropDownListSelectedTextStyle : {},
                  ]}>
                  {x.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
        {searchAble && !isWeb() && height + position.top + position.height > dimHeight ? (
          <View style={[styles.searchBarContainer, { marginTop: 15 }]}>
            <EvilIcons name={'search'} size={20} />
            <TextInput
              onChangeText={search}
              onFocus={validatePosition}
              placeholder={searchPlaceHolder}
              style={styles.searchBar}
            />
          </View>
        ) : null}
      </SafeAreaView>,
      id
    );
  };

  useEffect(() => {
    var generatedId = id;
    while (dropDownContext.component.find((x) => x.id == generatedId)) {
      generatedId = generatedId + '1';
    }
    setId(generatedId);
    dropDownContext.registerComponent(generatedId, setVisible);
    Dimensions.addEventListener('change', validatePosition);

    return () => {
      dropDownContext.unregisterComponent(generatedId);
      Dimensions.removeEventListener('change', validatePosition);
    };
  }, []);

  return (
    <TouchableOpacity
      ref={refs}
      style={[styles.input, style]}
      onLayout={() => validatePosition()}
      onPress={() => {
        if (visible) dropDownContext.clear(id);
        else show();
        setVisible(!visible);
      }}>
      <View>
        <Text style={{ textAlign: "left" }}>
          {selectedValue && items && items.length && includeIconOnTextInput
            ? items.find((x) => x.value == selectedValue)?.icon() ?? null
            : null}
          <Text style={{ paddingLeft: 5 }}>
            {selectedValue && items && items.length
              ? items.find((x) => x.value == selectedValue)?.label ??
              placeHolder
              : placeHolder}
          </Text>
        </Text>
        <AntDesign
          name="caretdown"
          size={16}
          style={[
            styles.arrow,
            {
              transform: [{ rotateX: visible ? '180deg' : '0deg' }],
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  searchBarContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    borderColor: '#CCC',
    borderWidth: 0.5,
    alignItems: 'center',
    borderRadius: 2,
    paddingLeft: 5,
    left: 0,
    height: 30,
    position: 'relative',
    width: '100%',
    marginBottom: 5,
  },

  searchBar: {
    fontSize: 12,
    padding: 0,
    marginBottom: 0,
    width: '95%',
    height: '90%',
    backgroundColor: 'transparent',
    paddingLeft: 5,
    borderBottomWidth: 0,
  },

  input: {
    width: '100%',
    height: 30,
    borderColor: '#CCC',
    borderWidth: 0.5,
    padding: 5,
    zIndex: 200,
    minWidth: 200,
  },

  arrow: {
    fontSize: 15,
    position: 'absolute',
    right: 5,
    fontWeight: 'bold',
  },

  dropDownItem: {
    flexDirection: 'row',
    width: '100%',
    padding: 5,
  },

  list: {
    borderColor: '#CCC',
    borderWidth: 0.5,
    position: 'absolute',
    zIndex: 200,
    backgroundColor: 'white',
    borderTopWidth: 0,
    minHeight: 200,
    maxHeight: 200
  },
});
